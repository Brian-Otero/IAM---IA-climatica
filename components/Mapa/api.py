from fastapi import FastAPI, UploadFile, File
import shutil
import os
import subprocess

app = FastAPI()

# Directorio donde se almacenarán los PNG
UPLOAD_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pngs")

# Asegurarse de que el directorio pngs existe
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # Definir la ruta donde se almacenará el archivo
    file_path = os.path.join(UPLOAD_DIRECTORY, "lluvia.png")

    # Guardar el archivo en el directorio pngs
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Llamar al script Python que procesará la imagen
    result = subprocess.run(["python3", "cv.py"], capture_output=True, text=True)

    if result.returncode == 0:
        return {"message": "Archivo procesado exitosamente"}
    else:
        return {"message": "Error al procesar el archivo", "details": result.stderr}
