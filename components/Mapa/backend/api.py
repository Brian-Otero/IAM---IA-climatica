# -*- coding: utf-8 -*-
from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import time
from ultralytics import YOLO  # Importar YOLOv8 para detección de objetos
import cv2
import numpy as np

app = FastAPI()

# Obtener el directorio base del proyecto correctamente
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Directorio donde se almacenarán los PNG
UPLOAD_DIRECTORY = os.path.join(BASE_DIR, "backend", "procesamiento", "pngs")

# Directorio de los KMLs en la carpeta Mapa HTML
KML_DIRECTORY = os.path.join(BASE_DIR, "backend", "Mapa html", "kmls")

# Ruta del script cv.py (relativo a la ubicación del proyecto)
CV_SCRIPT_PATH = os.path.join(BASE_DIR, "backend", "procesamiento", "cv.py")

# Asegurarse de que los directorios pngs y kmls existen
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(KML_DIRECTORY, exist_ok=True)

# Inicializar el ThreadPoolExecutor para paralelismo
executor = ThreadPoolExecutor(max_workers=4)

# Cargar el modelo YOLOv8 preentrenado
model = YOLO('best.pt')  # Modelo de YOLOv8

def procesar_imagen_cv(file_path):
    """
    Función para procesar la imagen usando el script cv.py.
    """
    try:
        # Ejecutar el script cv.py con la ruta de la imagen como argumento
        result = subprocess.run(
            ["python", CV_SCRIPT_PATH, file_path],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(f"Procesamiento con cv.py exitoso para: {file_path}")
            return {"status": "success", "message": result.stdout.strip()}
        else:
            print(f"Error en el procesamiento con cv.py: {result.stderr.strip()}")
            return {"status": "error", "message": result.stderr.strip()}
    except Exception as e:
        print(f"Excepción al ejecutar cv.py: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.post("/upload")
async def subir_archivo(file: UploadFile = File(...)):
    """
    Endpoint para subir imágenes y procesarlas usando el script cv.py.
    """
    # Generar un nombre único para el archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"lluvia_{timestamp}.png"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    # Guardar el archivo subido
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.exists(file_path):
        # Procesar la imagen usando el script cv.py
        resultado = procesar_imagen_cv(file_path)
        return {
            "message": f"Archivo subido exitosamente: {file_name}. Procesamiento en progreso...",
            "resultado": resultado
        }
    else:
        raise HTTPException(status_code=500, detail="Error al guardar el archivo.")

@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    """
    Endpoint para procesar imágenes únicamente con YOLOv8 y devolver las detecciones.
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
        raise HTTPException(status_code=500, detail="Error al guardar el archivo.")

def iniciar_servidor_flask():
    """
    Función para iniciar un servidor Flask desde un script externo.
    """
    try:
        # Ruta al script del servidor Flask
        FLASK_SCRIPT_PATH = os.path.join(BASE_DIR, "backend", "Mapa html", "servidor.py")

        # Imprimir la ruta para depuración
        print(f"Iniciando servidor Flask desde {FLASK_SCRIPT_PATH}...")

        while True:
            flask_process = subprocess.Popen(["python", FLASK_SCRIPT_PATH])
            flask_process.wait()
            print("Servidor Flask se ha detenido. Reiniciando...")
            time.sleep(2)
    except Exception as e:
        print(f"Error al iniciar el servidor Flask: {e}")

# Ejecutar el servidor Flask en un hilo separado
executor.submit(iniciar_servidor_flask)
