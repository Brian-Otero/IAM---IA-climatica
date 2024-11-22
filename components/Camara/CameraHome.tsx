import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ImagePickerResponse } from 'react-native-image-picker';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';

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
  const [mapData, setMapData] = useState<{ inFloodZone: boolean; rainIntensity: string | null }>({
    inFloodZone: false,
    rainIntensity: null,
  });
  const photoUri = photo?.assets?.[0]?.uri;

  const webViewRef = React.useRef<WebView>(null);

  const handleWebMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Datos recibidos desde la web:', data);

    setMapData({
      inFloodZone: data.inFloodZone,
      rainIntensity: data.rainIntensity,
    });
  };

  const fetchMapData = async (): Promise<void> => {
    return new Promise((resolve) => {
      // Obtener ubicación actual
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Ubicación actualizada:', latitude, longitude);

          // Enviar la ubicación a la WebView para obtener los datos
          webViewRef.current?.injectJavaScript(`
            if (window.updateUserLocation) {
              window.updateUserLocation(${latitude}, ${longitude});
            }
          `);

          resolve();
        },
        (error) => {
          console.log('Error obteniendo la ubicación:', error.message);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    });
  };

  const sendImageToApiWithRetries = async (
    photoUri: string,
    maxRetries: number = 5
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento ${attempt} de enviar la imagen a la API`);
        const response = await fetch('http://192.168.100.5:8001/predict/', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error en el intento ${attempt}:`, error.message);
        } else {
          console.error(`Error desconocido en el intento ${attempt}:`, error);
        }
  
        if (attempt === maxRetries) {
          throw new Error('Fallo al enviar la imagen después de múltiples intentos');
        }
      }
    }
  };
  

  const sendImageToApi = async (photoUri: string) => {
    try {
      if (!photoUri) {
        throw new Error('No hay foto disponible para procesar');
      }

      setLoading(true);

      // Abrir mapa en segundo plano para obtener los datos
      await fetchMapData();

      // Enviar la imagen con reintentos
      const data = await sendImageToApiWithRetries(photoUri);

      const iaDetectedRain = data.objects.some((obj: { label: string }) =>
        obj.label.toLowerCase().includes('rain')
      );

      // Comparar datos de la IA y del radar del IAM
      let resultMessage = '';
      if (iaDetectedRain) {
        if (mapData.rainIntensity) {
          resultMessage =
            `La IA detectó lluvia en la foto. ` +
            `El radar del IAM también indica lluvia con intensidad: ${mapData.rainIntensity}.`;
        } else {
          resultMessage =
            `La IA detectó lluvia en la foto, ` +
            `pero el radar del IAM no indica lluvia. Esto será reportado al instituto para su análisis.`;
        }
      } else {
        if (mapData.rainIntensity) {
          resultMessage =
            `La IA no detectó lluvia en la foto, ` +
            `pero el radar del IAM indica lluvia con intensidad: ${mapData.rainIntensity}. Esto será reportado al instituto para su análisis.`;
        } else {
          resultMessage = 'Tanto la IA como el radar del IAM coinciden en que no hay lluvia.';
        }
      }

      setDetections(resultMessage);

      // Mostrar las detecciones en un popup
      Alert.alert('Resultado de la Comparativa', resultMessage, [{ text: 'OK' }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al enviar la imagen a la API:', errorMessage);

      // Mostrar popup de error genérico
      Alert.alert('Error', errorMessage || 'Error al procesar la imagen', [{ text: 'OK' }]);
      setDetections('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Cámara</Text>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://192.168.100.5:5001' }}
        style={{ display: 'none' }} // Ocultar la WebView
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onMessage={handleWebMessage}
      />
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
