from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import pymongo
import gridfs
import time
from ultralytics import YOLO  # Importar YOLOv8 para detección de objetos
import cv2
import numpy as np

app = FastAPI()

# Obtener el directorio base del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directorio donde se almacenarán los PNG
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

# Cargar el modelo YOLOv8 preentrenado
model = YOLO('yolov8n.pt')  # Modelo de YOLOv8

def guardar_kml_en_mongodb(kml_path):
    """
    Función para almacenar un archivo KML en MongoDB usando GridFS.
    """
    with open(kml_path, "rb") as f:
        kml_data = f.read()
    
    file_id = fs.put(kml_data, filename=os.path.basename(kml_path))
    print(f"KML guardado en MongoDB con ID: {file_id}")
    return file_id

def actualizar_carpeta_kml(kml_path):
    """
    Función para actualizar el archivo KML en la carpeta kmls. Solo debe quedar uno.
    Si hay un archivo viejo, se guarda en la DB y luego se elimina.
    """
    nuevo_kml_name = "lluvias_areas.kml"
    nuevo_kml_path = os.path.join(KML_DIRECTORY, nuevo_kml_name)

    if os.path.exists(nuevo_kml_path):
        if not fs.exists({"filename": nuevo_kml_name}):
            print(f"Guardando el archivo antiguo {nuevo_kml_name} en MongoDB")
            guardar_kml_en_mongodb(nuevo_kml_path)
        os.remove(nuevo_kml_path)
        print(f"Archivo antiguo {nuevo_kml_name} eliminado.")

    shutil.move(kml_path, nuevo_kml_path)
    print(f"Archivo KML actualizado y movido a: {nuevo_kml_path}")

def procesar_imagen(file_path):
    """
    Función para procesar la imagen con YOLOv8.
    """
    # Cargar la imagen
    img = cv2.imread(file_path)

    # Realizar detección de objetos con YOLOv8
    results = model(img)
    
    # Procesar los resultados y extraer objetos detectados
    objects_detected = []
    for result in results[0].boxes:
        label = model.names[int(result.cls)]  # Nombre del objeto detectado
        confidence = result.conf  # Confianza del modelo
        objects_detected.append({'label': label, 'confidence': float(confidence)})

    print(f"Objetos detectados: {objects_detected}")

    # Continuar con el procesamiento normal (KML, etc.)
    result = subprocess.run(["python3", CV_SCRIPT_PATH, file_path], capture_output=True, text=True)

    if result.returncode == 0:
        print(f"Procesamiento exitoso para: {file_path}")
        kml_path = file_path.replace(".png", ".kml")
        if os.path.exists(kml_path):
            executor.submit(actualizar_carpeta_kml, kml_path)
        else:
            print(f"Error: El archivo KML no se generó para {file_path}")
    else:
        print(f"Error en el procesamiento de la imagen: {result.stderr}")

    # Retornar los objetos detectados para usarlos posteriormente
    return objects_detected

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"lluvia_{timestamp}.png"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.exists(file_path):
        # Procesar la imagen usando YOLOv8
        objects_detected = procesar_imagen(file_path)
        return {"message": f"Archivo subido exitosamente: {file_name}. Procesamiento en progreso...",
                "objects": objects_detected}
    else:
        return {"message": "Error al guardar el archivo"}

@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    """
    Ruta especial para procesar imágenes únicamente con YOLOv8 y devolver las detecciones.
    Después de procesar la imagen, se eliminará.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"predict_{timestamp}.png"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.exists(file_path):
        try:
            # Procesar la imagen usando solo YOLOv8
            img = cv2.imread(file_path)
            results = model(img)
            
            # Extraer resultados y retornar detecciones
            objects_detected = []
            for result in results[0].boxes:
                label = model.names[int(result.cls)]
                confidence = result.conf
                objects_detected.append({
                    'label': label,
                    'confidence': float(confidence)
                })

            return {"message": "Predicción completada con YOLOv8", "objects": objects_detected}
        finally:
            # Eliminar el archivo después de procesar
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Imagen eliminada: {file_path}")
    else:
        raise HTTPException(status_code=500, detail="Error al guardar el archivo")

@app.get("/get_kml/{date}")
async def get_kml_by_date(date: str):
    try:
        datetime.strptime(date, "%Y%m%d_%H%M%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Usa el formato YYYYMMDD_HHMMSS")

    file_name_pattern = f"lluvia_{date}_areas.kml"
    kml_file = fs.find_one({"filename": file_name_pattern})

    if not kml_file:
        raise HTTPException(status_code=404, detail=f"No se encontró KML para la fecha {date}")

    return {"kml_content": kml_file.read().decode('utf-8')} 

def iniciar_servidor_flask():
    try:
        FLASK_SCRIPT_PATH = os.path.join(BASE_DIR, "backend", "Mapa html", "servidor.py")

        while True:
            print("Iniciando servidor Flask...")
            flask_process = subprocess.Popen(["python", FLASK_SCRIPT_PATH])
            flask_process.wait()
            print("Servidor Flask se ha detenido. Reiniciando...")
            time.sleep(2)
    except Exception as e:
        print(f"Error al iniciar el servidor Flask: {e}")

executor.submit(iniciar_servidor_flask)
