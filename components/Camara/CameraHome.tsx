import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ImagePickerResponse } from 'react-native-image-picker';

type RootStackParamList = {
  Takepic: undefined;
  CameraHome: { photo: ImagePickerResponse } | undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CameraHome'>;
  route: RouteProp<RootStackParamList, 'CameraHome'>;
};

function CameraHome({ route, navigation }: Props) {
  const [photo, setPhoto] = useState(route.params?.photo);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<string | null>(null);
  const photoUri = photo?.assets?.[0]?.uri;

  const sendImageToApi = async (photoUri: string) => {
    try {
      if (!photoUri) {
        throw new Error("No hay foto disponible para procesar");
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      // Enviar imagen al servidor FastAPI que ejecuta YOLOv8
      const response = await fetch('http://127.0.0.1:8001/predict/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      const detectionText = data.objects.map(
        (obj: { label: string; confidence: number }) =>
          `${obj.label} (${(obj.confidence * 100).toFixed(2)}%)`
      ).join(', ');

      setDetections(detectionText);

      // Mostrar las detecciones en un popup
      Alert.alert(
        "Detecciones realizadas",
        detectionText || 'No se detectaron objetos',
        [{ text: "OK" }]
      );
    } catch (error) {
      // Comprobar que error es de tipo Error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      console.error('Error al enviar la imagen a la API:', errorMessage);

      // Mostrar popup de error genérico
      Alert.alert(
        "Error",
        errorMessage || "Error al procesar la imagen",
        [{ text: "OK" }]
      );

      setDetections('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Cámara</Text>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <TouchableOpacity
            style={styles.button}
            onPress={() => sendImageToApi(photoUri)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Procesando...' : 'Enviar a IAM IA'}
            </Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#5C6BC0" />}
        </>
      ) : (
        <Text style={styles.noFotoText}>No hay foto disponible</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Takepic')}>
        <Text style={styles.buttonText}>Tomar otra Foto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1124',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#dbddf0',
    fontWeight: 'bold',
  },
  photo: {
    width: '80%',
    height: '60%',
    borderRadius: 10,
    borderColor: '#5C6BC0',
    borderWidth: 2,
    marginBottom: 20,
  },
  noFotoText: {
    fontSize: 18,
    color: '#5C6BC0',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3366cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CameraHome;
