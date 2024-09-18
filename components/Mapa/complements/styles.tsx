import { StyleSheet } from 'react-native';

const circleSize = 50; // Define circleSize si no está definido en otro lugar

export const styleRain = StyleSheet.create({
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