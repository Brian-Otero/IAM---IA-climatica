from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import pymongo
import gridfs
import time


app = FastAPI()

# Obtener el directorio base del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directorio donde se almacenarán los PNG (relativo a la ubicación del proyecto)
UPLOAD_DIRECTORY = os.path.join(BASE_DIR, "backend", "procesamiento", "pngs")

# Directorio de los KMLs en la carpeta Mapa HTML
KML_DIRECTORY = os.path.join(BASE_DIR, "backend", "Mapa html", "kmls")

# Asegurarse de que el directorio pngs y kmls existen
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(KML_DIRECTORY, exist_ok=True)

# Ruta del script cv.py (relativo a la ubicación del proyecto)
CV_SCRIPT_PATH = os.path.join(BASE_DIR, "backend", "procesamiento", "cv.py")

# Configuración de MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["kml_db"]
fs = gridfs.GridFS(db)

# Inicializar el ThreadPoolExecutor para paralelismo
executor = ThreadPoolExecutor(max_workers=4)

def guardar_kml_en_mongodb(kml_path):
    """
    Función para almacenar un archivo KML en MongoDB usando GridFS.
    """
    with open(kml_path, "rb") as f:
        kml_data = f.read()
    
    # Guardar el archivo en GridFS
    file_id = fs.put(kml_data, filename=os.path.basename(kml_path))
    print(f"KML guardado en MongoDB con ID: {file_id}")
    return file_id

def actualizar_carpeta_kml(kml_path):
    """
    Función para actualizar el archivo KML en la carpeta kmls. Solo debe quedar uno.
    Si hay un archivo viejo, se guarda en la DB y luego se elimina.
    """
    # Nombre del archivo KML actual
    nuevo_kml_name = "lluvias_areas.kml"
    nuevo_kml_path = os.path.join(KML_DIRECTORY, nuevo_kml_name)

    # Verificar si ya existe un archivo KML viejo
    if os.path.exists(nuevo_kml_path):
        # Confirmar si el archivo ya está en MongoDB antes de eliminarlo
        if not fs.exists({"filename": nuevo_kml_name}):
            # Guardar el archivo viejo en MongoDB antes de eliminarlo
            print(f"Guardando el archivo antiguo {nuevo_kml_name} en MongoDB")
            guardar_kml_en_mongodb(nuevo_kml_path)
        # Eliminar el archivo viejo
        os.remove(nuevo_kml_path)
        print(f"Archivo antiguo {nuevo_kml_name} eliminado.")

    # Mover el nuevo archivo KML generado a la carpeta KMLs
    shutil.move(kml_path, nuevo_kml_path)
    print(f"Archivo KML actualizado y movido a: {nuevo_kml_path}")

def procesar_imagen(file_path):
    """
    Función para procesar la imagen y generar el KML.
    """
    result = subprocess.run(["python3", CV_SCRIPT_PATH, file_path], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"Procesamiento exitoso para: {file_path}")
        kml_path = file_path.replace(".png", ".kml")  # Asumimos que el KML tiene el mismo nombre base
        if os.path.exists(kml_path):
            # Actualizar la carpeta de KMLs (solo dejar el nuevo)
            executor.submit(actualizar_carpeta_kml, kml_path)
        else:
            print(f"Error: El archivo KML no se generó para {file_path}")
    else:
        print(f"Error en el procesamiento de la imagen: {result.stderr}")

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # Crear un nombre de archivo único usando la fecha y hora actual
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"lluvia_{timestamp}.png"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    # Guardar el archivo en el directorio pngs
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Verificar que el archivo se ha guardado correctamente
    if os.path.exists(file_path):
        # Ejecutar el procesamiento de la imagen en un hilo paralelo
        executor.submit(procesar_imagen, file_path)
        return {"message": f"Archivo subido exitosamente: {file_name}. Procesamiento en progreso..."}
    else:
        return {"message": "Error al guardar el archivo"}

@app.get("/get_kml/{date}")
async def get_kml_by_date(date: str):
    """
    Recuperar un KML anterior de MongoDB según una fecha específica.
    """
    # Convertir la fecha proporcionada en un patrón de búsqueda de KML
    try:
        datetime.strptime(date, "%Y%m%d_%H%M%S")  # Verificar que el formato es válido
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Usa el formato YYYYMMDD_HHMMSS")

    # Formar el patrón de búsqueda para archivos KML
    file_name_pattern = f"lluvia_{date}_areas.kml"

    # Buscar el archivo en GridFS
    kml_file = fs.find_one({"filename": file_name_pattern})

    if not kml_file:
        raise HTTPException(status_code=404, detail=f"No se encontró KML para la fecha {date}")

    # Devolver el contenido del KML
    return {"kml_content": kml_file.read().decode('utf-8')} 

def iniciar_servidor_flask():
    """
    Función para iniciar el servidor Flask que sirve el HTML y recursos estáticos.
    """
    try:
        # Ruta al archivo server.py que maneja el servidor Flask
        FLASK_SCRIPT_PATH = os.path.join(BASE_DIR, "backend", "Mapa html", "servidor.py")

        # Iniciar el servidor Flask
        while True:
            print("Iniciando servidor Flask...")
            flask_process = subprocess.Popen(["python", FLASK_SCRIPT_PATH])
            
            # Monitorear si el servidor Flask falla y reiniciarlo
            flask_process.wait()
            print("Servidor Flask se ha detenido. Reiniciando...")
            time.sleep(2)  # Esperar 2 segundos antes de reiniciar
    except Exception as e:
        print(f"Error al iniciar el servidor Flask: {e}")

# Iniciar el servidor Flask en un hilo separado
executor.submit(iniciar_servidor_flask)
