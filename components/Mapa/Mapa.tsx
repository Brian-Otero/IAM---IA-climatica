import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, PermissionsAndroid, Platform } from 'react-native';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';

// Definir la interfaz para el estado de ubicación
interface Location {
  latitude: number;
  longitude: number;
}

const App = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Solicitar permiso de ubicación en Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Geolocalización',
            message: 'La aplicación necesita acceso a tu ubicación.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de ubicación concedido');
          getLocation(); // Obtener la ubicación tras conceder el permiso
        } else {
          console.log('Permiso de ubicación denegado');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getLocation(); // Obtener la ubicación automáticamente en iOS
    }
  };

  // Función para obtener la ubicación actual
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log('Ubicación obtenida:', latitude, longitude);

        // Inyectar la ubicación en la web directamente
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.updateUserLocation) {
              window.updateUserLocation(${latitude}, ${longitude});
            }
          `);
        }

        // Verificar si está en una zona de inundación simulada
        checkIfInFloodZone(latitude, longitude);
      },
      error => {
        console.log('Error obteniendo la ubicación:', error.message);
        Alert.alert('Error obteniendo ubicación', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Simulación de la verificación de si está en una zona de inundación
  const checkIfInFloodZone = (lat: number, lng: number) => {
    const isInFloodZone = Math.random() > 0.5; // Simulación de zona de inundación
    if (isInFloodZone) {
      sendNotification('¡Alerta!', 'Estás en una zona de inundación o lluvia.');
    } else {
      sendNotification('Todo bien', 'No estás en una zona peligrosa.');
    }
  };

  // Función para enviar notificación al dispositivo
  const sendNotification = (title: string, message: string) => {
    PushNotification.localNotification({
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
    });
  };

  // Solicitar permiso de ubicación cuando la app se inicia
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://10.214.84.147:5500/components/Mapa/mapa.html' }} // Reemplaza con tu URL local
        onMessage={event => {
          const data = JSON.parse(event.nativeEvent.data);
          console.log('Mensaje recibido de la web:', data);
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default App;
