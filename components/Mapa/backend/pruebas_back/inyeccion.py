import os
import requests

# URL de la API
url = "http://148.202.152.59:8002/upload/"

# Ruta de la carpeta con los archivos KML
kml_folder = "./kml_prueba"

# Iterar sobre todos los archivos KML en la carpeta
for filename in os.listdir(kml_folder):
    if filename.endswith(".kml"):  # Verificar que el archivo sea KML
        file_path = os.path.join(kml_folder, filename)

        # Enviar el archivo a la API usando una petición POST
        with open(file_path, 'rb') as file:
            response = requests.post(url, files={"file": file})

        # Imprimir la respuesta
        print(f"Archivo {filename} procesado: {response.status_code} - {response.json()}")
