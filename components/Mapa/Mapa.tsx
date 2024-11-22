import React, { useEffect, useRef, useState } from 'react';
import { View, Text, PermissionsAndroid, Platform, TouchableOpacity, Image } from 'react-native';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';
import { useNavigation } from '@react-navigation/native';

interface Location {
  latitude: number;
  longitude: number;
}

const App = () => {
  const navigation = useNavigation(); // Hook para la navegación
  const [location, setLocation] = useState<Location | null>(null);
  const [kmlActive, setKmlActive] = useState(false); // Estado para saber si el KML está activo
  const webViewRef = useRef<WebView>(null);

  // Crear el canal de notificación
  const createNotificationChannel = () => {
    PushNotification.createChannel(
      {
        channelId: 'weather-alert-channel',
        channelName: 'Alertas de Clima',
        channelDescription: 'Canal para notificaciones de clima e inundaciones',
        importance: 4,
        vibrate: true,
      },
      (created) =>
        console.log(`Canal de notificaciones creado: ${created ? 'nuevo' : 'existente'}`)
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
      (position) => {
        const { latitude, longitude } = position.coords;

        // Actualizar la ubicación
        setLocation({ latitude, longitude });
        console.log('Ubicación actualizada:', latitude, longitude);

        // Inyectar la ubicación en la web
        if (webViewRef.current) {
          sendLocationToWeb(latitude, longitude);
        }
      },
      (error) => {
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

  // Función para enviar el estado del botón de KML al WebView
  const toggleKmlLayer = () => {
    const newState = !kmlActive;
    setKmlActive(newState);

    // Inyectar el estado en la WebView
    webViewRef.current?.injectJavaScript(`
      if (window.toggleKmlLayer) {
        window.toggleKmlLayer(${newState});
      }
    `);
  };

  // Función para manejar mensajes recibidos de la web
  const handleWebMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Datos recibidos desde la web:', data);

    const { inFloodZone, rainIntensity } = data;

    // Determinar el estado actual y enviar una sola notificación
    let title = '';
    let message = '';

    if ((rainIntensity === 'fuerte' || rainIntensity === 'moderada') && inFloodZone) {
      title = '¡Advertencia!';
      message =
        'Se está presentando lluvia intensa y estás en una zona de inundación. Ten precaución.';
    } else if (rainIntensity === 'fuerte' || rainIntensity === 'moderada') {
      title = 'Información';
      message = 'Está lloviendo en tu ubicación.';
    } else if (rainIntensity === 'ligera') {
      title = 'Clima';
      message = 'Hay una ligera llovizna en tu ubicación.';
    } else {
      // No enviar notificación si no está lloviendo
      return;
    }

    sendNotification(title, message);
  };

  // Función para enviar notificación al dispositivo
  const sendNotification = (title: string, message: string) => {
    console.log('Enviando notificación:', title, message);
    PushNotification.localNotification({
      channelId: 'weather-alert-channel',
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
      {/* Logo grande en la parte superior */}
      <View
        style={{
          position: 'absolute',
          top: 40,
          alignSelf: 'center',
          zIndex: 2,
        }}
      >
        <Image
          source={require('./assets/logo_iam.png')} // Cambia esta ruta según la ubicación del logo
          style={{ width: 347, height: 90, top: -6, left: 34, resizeMode: 'contain' }}
        />
      </View>
      {/* Botón de regresar */}
      <View style={{ position: 'absolute', top: 48, left: 4, zIndex: 2 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('./assets/93634.png')} // Cambia esta ruta según la ubicación de la flecha
            style={{ width: 320, height: 60, top: 0, left: -132, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://192.168.100.5:5001' }}
        onMessage={handleWebMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        style={{ flex: 1 }}
      />
      <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <TouchableOpacity
          onPress={toggleKmlLayer}
          style={{
            padding: 10,
            backgroundColor: kmlActive ? 'red' : 'blue',
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            {kmlActive ? 'Ocultar Zonas' : 'Mostrar Zonas'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default App;
