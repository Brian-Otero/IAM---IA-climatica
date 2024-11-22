# -*- coding: utf-8 -*-
from flask import Flask, send_from_directory, request, make_response
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
    # Obtener el parámetro 'kml' de la URL (por ejemplo, ?kml=true o ?kml=false)
    kml_active = request.args.get('kml', 'false').lower()  # Valor por defecto es 'false'
    if kml_active not in ['true', 'false']:
        kml_active = 'false'
    # Leer el contenido del archivo HTML
    with open(os.path.join(HTML_DIRECTORY, 'mapa.html'), 'r', encoding='utf-8') as f:
        html_content = f.read()
    # Insertar una variable JavaScript para controlar la visibilidad del KML
    script_injection = f'<script>var kmlLayerVisible = {kml_active};</script>'
    # Insertar el script justo después de la etiqueta <body>
    html_content = html_content.replace('<body>', f'<body>\n{script_injection}')
    # Devolver la respuesta con el HTML modificado
    response = make_response(html_content)
    response.headers['Content-Type'] = 'text/html'
    return response

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
    app.run(host='0.0.0.0', port=5001, debug=True)
