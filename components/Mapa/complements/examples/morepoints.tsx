import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Configura tu token de acceso de Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZmVhdGhlcmVkc25ha2UiLCJhIjoiY20xMTVnNDdyMHBodTJub3JjZmdvbHcyMSJ9.jsOifa5cHHAD8JobUX2Wfg');

// Coordenadas de Guadalajara y Zapopan
const guadalajaraCoordinates = [-103.3396, 20.6672];
const zapopanCoordinates = [-103.3848, 20.7236];

// Dimensiones del círculo
const circleSize = 100;

// Componente que simula un círculo en las coordenadas
const Circle = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación del círculo (pulso suave)
    Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // Escala el círculo
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4, // Cambia la opacidad
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

// Componente que contiene el círculo en una ubicación específica
const CircleInLocation = () => {
  return (
    <View style={styles.circleContainer}>
      <Circle />
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.page}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          centerCoordinate={guadalajaraCoordinates}
          zoomLevel={11}
        />

        {/* Punto fijo para el círculo en Guadalajara */}
        <Mapbox.PointAnnotation
          id="circle-guadalajara"
          coordinate={guadalajaraCoordinates} // Coordenadas del círculo en Guadalajara
        >
          <CircleInLocation />
        </Mapbox.PointAnnotation>

        {/* Punto fijo para el círculo en Zapopan */}
        <Mapbox.PointAnnotation
          id="circle-zapopan"
          coordinate={zapopanCoordinates} // Coordenadas del círculo en Zapopan
        >
          <CircleInLocation />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: circleSize,
    height: circleSize,
    backgroundColor: 'rgba(135,206,250, 0.5)', // Azul claro con transparencia
    borderRadius: circleSize / 2, // Hace que sea un círculo
    borderWidth: 2,
    borderColor: 'rgba(135,206,250, 0.8)',
  },
});
