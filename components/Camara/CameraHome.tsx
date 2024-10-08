import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
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
  const [loading, setLoading] = useState(false); // Estado de carga para la API
  const [detectionResults, setDetectionResults] = useState<any>(null); // Almacenar resultados de la API

  const { width } = Dimensions.get('window'); //get dimensiones de pantalla
  const imageSize = width * 0.8;

  const photoUri = photo?.assets?.[0]?.uri;

  // Función para enviar la imagen a la API YOLOv8
  const sendToYOLOv8API = async (uri: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    });

    try {
      const response = await fetch('https://tu-api-de-yolov8.com/predict', { //llamada a la API 
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const jsonResponse = await response.json();
      setDetectionResults(jsonResponse); // Guardar los resultados de YOLOv8
    } catch (error) {
      console.error('Error al hacer la llamada a la API:', error);
    } finally {
      setLoading(false); // Terminar el estado de carga
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Cámara</Text>
      
      {photoUri ? (
        <>
          <Image
            source={{ uri: photoUri }}
            style={{ width: imageSize, height: imageSize }}
          />
          <Button
            title="Procesar Imagen con YOLOv8"
            onPress={() => sendToYOLOv8API(photoUri)}
          />
        </>
      ) : (
        <Text>No hay foto disponible</Text>
      )}

      {/* Mostrar indicador de carga mientras se procesa */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Mostrar resultados de la detección si existen */}
      {detectionResults && (
        <View style={styles.resultsContainer}>
          <Text>Resultados de YOLOv8:</Text>
          {detectionResults.map((result: any, index: number) => (
            <Text key={index}>
              {result.class} - Confianza: {result.confidence}
            </Text>
          ))}
        </View>
      )}

      <Button
        title="Tomar otra Foto"
        onPress={() => navigation.navigate('Takepic')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  photoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
  },
  info: {
    marginTop: 10,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default CameraHome;
