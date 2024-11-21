from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

# Cargar el modelo entrenado
model_path = "components/Mapa/backend/best.pt"
model = YOLO(model_path)

# Función para cargar y analizar una imagen
def detect_rain(image_path):
    # Realizar la predicción
    results = model(image_path)

    # Mostrar las detecciones
    detections = results[0].boxes.data  # Detecciones en el primer resultado
    if len(detections) == 0:
        print("No se detectó lluvia en la imagen.")
    else:
        print("Detecciones:")
        for det in detections:
            cls = int(det[5])  # Clase detectada
            confidence = float(det[4])  # Confianza
            bbox = det[:4].tolist()  # Coordenadas del bounding box
            print(f"Clase: {cls}, Confianza: {confidence:.2f}, BBox: {bbox}")

    # Mostrar la imagen con las detecciones
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    plt.imshow(img)
    plt.axis("off")
    plt.show()

# Ruta de la imagen para analizar
image_path = "components/Mapa/backend/imagenes.jpg"  # Cambia esto por la ruta de tu imagen
detect_rain(image_path)
