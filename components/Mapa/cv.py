import cv2
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon
import os

# Obtener el directorio actual donde se está ejecutando el script
current_directory = os.path.dirname(os.path.abspath(__file__))

# Ruta de la imagen PNG dentro del directorio actual
image_path = os.path.join(current_directory, "lluvia.png")

# Verificar que el archivo existe
if not os.path.exists(image_path):
    print(f"Error: El archivo no existe en la ruta {image_path}")
else:
    # Leer la imagen
    img = cv2.imread(image_path)

    # Verificar que la imagen fue cargada correctamente
    if img is None:
        print("Error: No se pudo cargar la imagen. Verifica la ruta y el formato.")
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

        # Mapa de colores a intensidades de lluvia basado en la guía proporcionada (sin granizo)
        # Ajustamos los rangos de saturación y brillo para tomar en cuenta colores más fuertes y centrados.
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

            # Ruta de salida del archivo KML en el mismo directorio del script
            output_kml_path = os.path.join(current_directory, "lluvias_areas.kml")
            gdf.to_file(output_kml_path, driver="KML")

            print(f"Proceso completado, archivo KML generado en: {output_kml_path}")
        else:
            print("No se encontraron áreas de lluvia.")
