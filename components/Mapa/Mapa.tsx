import Mapbox from '@rnmapbox/maps';
import { View } from 'react-native';
import { styleRain } from './complements/styleCircle';
import Circle from './complements/circle';
import { floodStyle } from './complements/styleTriangle';
import FloodZone from './complements/triangulo';

// Configura tu token de acceso de Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZmVhdGhlcmVkc25ha2UiLCJhIjoiY20xMTVnNDdyMHBodTJub3JjZmdvbHcyMSJ9.jsOifa5cHHAD8JobUX2Wfg');

// Coordenadas para las ubicaciones
const locations = [
  { id: 'circle-guadalajara', coordinates: [-103.3396, 20.6672] }, // Guadalajara
  { id: 'circle-zapopan', coordinates: [-103.3848, 20.7236] },    // Zapopan
  { id: 'circle-tlaquepaque', coordinates: [-103.3117, 20.6406] }, // Tlaquepaque
];

const floodLocations = [
  { id: 'circle-tlajomulco', coordinates: [-103.4473, 20.4747] },  // Tlajomulco
];

// Componente que representa un ícono triangular
const TriangleInLocation = () => {
  return (
    <View style={floodStyle.icon}>
      <FloodZone />
    </View>
  );
};

// Componente que representa un círculo en una ubicación
const CircleInLocation = () => {
  return (
    <View style={styleRain.circleContainer}>
      <Circle />
    </View>
  );
};

// Componente principal de la aplicación
const App = () => {
  return (
    <View style={styleRain.page}>
      <Mapbox.MapView style={styleRain.map}>
        {/* Cámara centrada en Guadalajara */}
        <Mapbox.Camera
          centerCoordinate={locations[0].coordinates}
          zoomLevel={11}
        />

        {/* Círculo fijo alrededor de Guadalajara */}
        <Mapbox.ShapeSource
          id="fixed-circle"
          shape={{
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  createCircleCoordinates(locations[0].coordinates, 1.44), // Radio en grados (ajusta según sea necesario)
                ],
              },
              properties: {},
            }],
          }}
        >
          <Mapbox.FillLayer
            id="fixed-circle-layer"
            style={{
              fillColor: 'rgba(255, 0, 0, 0.0)', // Color rojo con opacidad
              fillOutlineColor: 'rgba(255, 0, 0, 1)', // Borde rojo sólido
              lineWidth: 5, // Ancho del borde (ajusta aquí)
            }}
          />
        </Mapbox.ShapeSource>

        {/* Añadir anotaciones de círculo en las ubicaciones */}
        {locations.map(location => (
          <Mapbox.PointAnnotation
            key={location.id}
            id={location.id}
            coordinate={location.coordinates}
          >
            <CircleInLocation />
          </Mapbox.PointAnnotation>
        ))}

        {/* Añadir anotaciones de triángulo en las zonas de inundación */}
        {floodLocations.map(floodLocation => (
          <Mapbox.PointAnnotation
            key={floodLocation.id}
            id={floodLocation.id}
            coordinate={floodLocation.coordinates}
          >
            <TriangleInLocation />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>
    </View>
  );
};

// Función para crear coordenadas de un círculo
const createCircleCoordinates = (center: number[], radius: number) => {
  const coordinates = [];
  const points = 30; // Número de puntos en el círculo
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI; // Convertir a radianes
    const dx = radius * Math.cos(angle); // Cambia el radio según tus necesidades
    const dy = radius * Math.sin(angle);
    coordinates.push([center[0] + dx, center[1] + dy]); // Ajustar la longitud y latitud
  }
  coordinates.push(coordinates[0]); // Cerrar el círculo
  return coordinates;
};

export default App;
