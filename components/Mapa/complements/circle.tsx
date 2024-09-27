import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { styleRain } from './styleCircle'; // Ajusta la ruta según sea necesario

// Componente que simula un círculo en las coordenadas

const Circle = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  /*
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
  */

  return (
    <Animated.View
      style={[
        styleRain.circle,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

export default Circle;