import React, { useRef } from 'react';
import { Animated, Image } from 'react-native';
import { floodStyle } from './styleTriangle'; // Ajusta la ruta según sea necesario

// Componente que usa un ícono PNG para representar zonas de inundación
const FloodZone = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current; // Opacidad al 50%

  return (
    <Animated.Image
      source={require('./images/nube.png')} // Cambia a la ruta del ícono PNG
      style={[
        floodStyle.icon, // Definimos el estilo del ícono aquí
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      resizeMode="contain" // Ajusta el tamaño de la imagen dentro del contenedor
    />
  );
};

export default FloodZone;
