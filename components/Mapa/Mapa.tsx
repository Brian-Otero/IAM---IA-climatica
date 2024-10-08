import React, { useEffect, useRef, useState } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';

interface Location {
  latitude: number;
  longitude: number;
}

const App = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Crear el canal de notificación
  const createNotificationChannel = () => {
    PushNotification.createChannel(
      {
        channelId: "weather-alert-channel",
        channelName: "Alertas de Clima",
        channelDescription: "Canal para notificaciones de clima e inundaciones",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Canal de notificaciones creado: ${created ? 'nuevo' : 'existente'}`)
    );
  };

  // Solicitar permiso de notificaciones (Android 13+)
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso de notificaciones denegado');
      }
    }
  };

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
          getLocation(); // Obtener la ubicación una vez
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

        // Actualizar la ubicación
        setLocation({ latitude, longitude });
        console.log('Ubicación actualizada:', latitude, longitude);

        // Inyectar la ubicación en la web
        if (webViewRef.current) {
          sendLocationToWeb(latitude, longitude);
        }

        sendNotification('Clima despejado', 'Hace un agradable dia afuera, sin peligro de lluvia por el momento.');
      },
      error => {
        console.log('Error obteniendo la ubicación:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Función para enviar la ubicación a la WebView
  const sendLocationToWeb = (latitude: number, longitude: number) => {
    webViewRef.current?.injectJavaScript(`
      if (window.updateUserLocation) {
        window.updateUserLocation(${latitude}, ${longitude});
      }
    `);
  };

  // Función para manejar mensajes recibidos de la web
  const handleWebMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Datos recibidos desde la web:', data);

    const { inFloodZone, rainIntensity } = data;

    if (rainIntensity === "fuerte" && inFloodZone) {
      sendNotification('¡Advertencia!', 'Se está presentando lluvia intensa y estás en una zona de inundación. Ten precaución.');
    } else if (rainIntensity === "fuerte") {
      sendNotification('Información', 'Está lloviendo intensamente en tu ubicación.');
    } else if (inFloodZone) {
      sendNotification('Atención', 'Estás en una zona de inundación.');
    } else {
      sendNotification('Todo bien', 'No hay condiciones peligrosas en tu zona.');
    }
  };

  // Función para enviar notificación al dispositivo
  const sendNotification = (title: string, message: string) => {
    console.log('Enviando notificación:', title, message);
    PushNotification.localNotification({
      channelId: "weather-alert-channel",
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
    });
  };

  // Solicitar permisos y configurar notificaciones al iniciar
  useEffect(() => {
    createNotificationChannel();
    requestNotificationPermission();
    requestLocationPermission();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://192.168.100.5:5500/components/Mapa/backend/Mapa html/mapa.html' }}
        onMessage={handleWebMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default App;
