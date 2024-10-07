import React, { useEffect, useRef, useState } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';

// Definir la interfaz para el estado de ubicación
interface Location {
  latitude: number;
  longitude: number;
}

// Definir la interfaz para el estado de condiciones
interface Condition {
  flood: boolean;
  rain: string;
}

const App = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [previousCondition, setPreviousCondition] = useState<Condition>({ flood: false, rain: 'ligera' });
  const webViewRef = useRef<WebView>(null);

  // Crear el canal de notificación
  const createNotificationChannel = () => {
    PushNotification.createChannel(
      {
        channelId: "weather-alert-channel", // ID único del canal
        channelName: "Alertas de Clima", // Nombre del canal visible para el usuario
        channelDescription: "Canal para notificaciones de clima e inundaciones", // Descripción del canal
        importance: 4, // Importancia del canal: alta
        vibrate: true, // Habilitar vibración
      },
      (created) => console.log(`Canal de notificaciones creado: ${created ? 'nuevo' : 'existente'}`) // Log para ver si el canal fue creado
    );
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
          startLocationUpdates(); // Comenzar a obtener la ubicación repetidamente
        } else {
          console.log('Permiso de ubicación denegado');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      startLocationUpdates(); // Obtener la ubicación automáticamente en iOS
    }
  };

  // Función para obtener la ubicación actual
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        // Solo actualizar si la ubicación ha cambiado significativamente
        if (!location || (location.latitude !== latitude || location.longitude !== longitude)) {
          setLocation({ latitude, longitude });
          console.log('Ubicación actualizada:', latitude, longitude);

          // Inyectar la ubicación en la web directamente
          if (webViewRef.current) {
            sendLocationToWeb(latitude, longitude);
          }
        }
      },
      error => {
        console.log('Error obteniendo la ubicación:', error.message);
        // Intentar nuevamente en 5 segundos si ocurre un error
        setTimeout(getLocation, 5000);
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

  // Función para iniciar el ciclo de actualizaciones de la ubicación
  const startLocationUpdates = () => {
    getLocation(); // Obtener la ubicación inmediatamente
    const intervalId = setInterval(getLocation, 15000); // Actualizar cada 15 segundos

    return () => clearInterval(intervalId); // Limpiar el intervalo cuando el componente se desmonte
  };

  // Función para manejar mensajes recibidos de la web
  const handleWebMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Mensaje recibido de la web:', data);

    const { inFloodZone, rainIntensity } = data;

    // Verificar si hay un cambio en la condición
    if (
      inFloodZone !== previousCondition.flood || 
      rainIntensity !== previousCondition.rain
    ) {
      // Si hay cambio en la condición, actualizar el estado y enviar notificación
      setPreviousCondition({ flood: inFloodZone, rain: rainIntensity });

      if (rainIntensity === "fuerte" && inFloodZone) {
        sendNotification('¡Advertencia!', 'Se está presentando lluvia intensa y estás en una zona de inundación. Ten precaución.');
      } else if (rainIntensity === "fuerte") {
        sendNotification('Información', 'Está lloviendo intensamente en tu ubicación.');
      } else {
        sendNotification('Todo bien', 'No hay condiciones peligrosas en tu zona.');
      }
    } else {
      console.log('Condiciones iguales, no se envía notificación.');
    }
  };

  // Función para enviar notificación al dispositivo
  const sendNotification = (title: string, message: string) => {
    PushNotification.localNotification({
      channelId: "weather-alert-channel", // Usar el canal creado
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
    });
  };

  // Solicitar permiso de ubicación cuando la app se inicia
  useEffect(() => {
    createNotificationChannel(); // Crear canal de notificación
    requestLocationPermission();

    // Limpiar el intervalo cuando el componente se desmonte
    return startLocationUpdates();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://10.214.84.147:5500/components/Mapa/mapa.html' }} // Reemplaza con tu URL local
        onMessage={handleWebMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default App;
