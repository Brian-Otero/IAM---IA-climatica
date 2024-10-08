from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Ruta base del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directorios relevantes
HTML_DIRECTORY = os.path.join(BASE_DIR)  # Directorio donde está el archivo HTML
GIF_DIRECTORY = os.path.join(BASE_DIR, "complements", "gifs")  # Directorio de los GIFs
KML_DIRECTORY = os.path.join(BASE_DIR, "kmls")  # Directorio de los KMLs

# Ruta para servir el archivo HTML principal
@app.route('/')
def serve_html():
    return send_from_directory(HTML_DIRECTORY, 'mapa.html')

# Ruta para servir los GIFs desde la carpeta /complements/gifs/
@app.route('/complements/gifs/<path:filename>')
def serve_gifs(filename):
    return send_from_directory(GIF_DIRECTORY, filename)

# Ruta para servir archivos KML desde la carpeta /kmls/
@app.route('/kmls/<path:filename>')
def serve_kmls(filename):
    return send_from_directory(KML_DIRECTORY, filename)

# Iniciar el servidor Flask
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
