import sys
import cv2
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon
import os

# Obtener el directorio base del proyecto (la carpeta "components")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directorio de salida de los archivos KML en "components/Mapa/backend/Mapa html/kmls"
kml_directory = os.path.join(BASE_DIR,  "Mapa html", "kmls")

# Asegurarse de que el directorio kmls existe
os.makedirs(kml_directory, exist_ok=True)

def process_image(image_path):
    """
    Función para procesar la imagen y generar un archivo KML con las áreas de lluvia.
    El nombre del archivo KML se generará basado en el nombre de la imagen.
    """
    # Verificar que el archivo existe
    if not os.path.exists(image_path):
        print(f"Error: El archivo no existe en la ruta {image_path}")
        return {"status": "error", "message": "El archivo de imagen no existe"}
    else:
        # Leer la imagen
        img = cv2.imread(image_path)

        # Verificar que la imagen fue cargada correctamente
        if img is None:
            print("Error: No se pudo cargar la imagen. Verifica la ruta y el formato.")
            return {"status": "error", "message": "No se pudo cargar la imagen"}
        else:
            # Convertir la imagen de BGR a HSV
            hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

            # Dimensiones de la imagen
            height, width, _ = img.shape

            # Coordenadas del área de la imagen (extraídas del KML)
            north = 22.03030437021881
            south = 19.32059531316582
            east = -101.9462411978663
            west = -104.8254262826025

            # Mapa de colores a intensidades de lluvia basado en la guía proporcionada
            color_ranges = {
                'débil': ([35, 100, 100], [85, 255, 255]),  # Verde claro
                'ligera': ([35, 150, 150], [85, 255, 255]),  # Verde oscuro
                'moderada a fuerte': ([25, 170, 170], [35, 255, 255]),  # Amarillo
                'moderada a fuerte (cian)': ([85, 170, 170], [95, 255, 255]),  # Cian
            }

            # Crear una lista para almacenar las áreas de lluvia (polígonos)
            rain_data = []

            # Radio ajustado para áreas más pequeñas y precisas
            radius_deg = 0.003  # Ajustado para reflejar áreas más precisas (300-400m aprox.)

            # Función para crear un círculo aproximado alrededor de un punto dado en lat/lon
            def create_circle(lon, lat, radius_deg, num_points=30):
                """
                Genera un polígono circular aproximado alrededor de un punto en coordenadas lat/lon.
                lon: longitud del centro
                lat: latitud del centro
                radius_deg: radio del círculo en grados
                num_points: número de puntos para aproximar el círculo
                """
                circle_points = []
                for i in range(num_points):
                    angle = 2 * np.pi * i / num_points
                    dx = radius_deg * np.cos(angle)
                    dy = radius_deg * np.sin(angle)
                    circle_points.append((lon + dx, lat + dy))
                return Polygon(circle_points)

            # Función para convertir coordenadas de píxel a geográficas
            def pixel_to_coords(x, y):
                lon = west + (x / width) * (east - west)
                lat = north - (y / height) * (north - south)
                return lon, lat

            # Recorrer la imagen HSV para obtener los colores según la saturación y el tono
            for rain_type, (lower, upper) in color_ranges.items():
                lower = np.array(lower, dtype="uint8")
                upper = np.array(upper, dtype="uint8")
                mask = cv2.inRange(hsv_img, lower, upper)  # Crear máscara con rango de color en HSV

                # Encontrar los píxeles que coincidan con el rango de colores
                for y in range(height):
                    for x in range(width):
                        if mask[y, x] > 0:
                            # Convertir coordenadas de píxeles a coordenadas geográficas
                            lon, lat = pixel_to_coords(x, y)
                            
                            # Crear un círculo en lugar de un punto para representar un área de lluvia
                            area_of_rain = create_circle(lon, lat, radius_deg)
                            
                            # Agregar los datos a la lista con geometría de tipo área
                            rain_data.append({
                                'geometry': area_of_rain,
                                'intensity': rain_type
                            })

            # Crear un GeoDataFrame con las áreas de lluvia
            if rain_data:
                gdf = gpd.GeoDataFrame(rain_data, crs="EPSG:4326")

                # Obtener el nombre base de la imagen para usarlo en el archivo KML
                image_name = os.path.splitext(os.path.basename(image_path))[0]

                # Ruta de salida del archivo KML en el directorio kmls
                output_kml_path = os.path.join(kml_directory, f"{image_name}_areas.kml")
                gdf.to_file(output_kml_path, driver="KML")

                print(f"Proceso completado, archivo KML generado en: {output_kml_path}")
                return {"status": "success", "message": f"Archivo KML generado: {output_kml_path}"}
            else:
                print("No se encontraron áreas de lluvia.")
                return {"status": "error", "message": "No se encontraron áreas de lluvia."}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Error: Debes proporcionar la ruta de la imagen a procesar.")
        sys.exit(1)

    image_path = sys.argv[1]
    process_image(image_path)
