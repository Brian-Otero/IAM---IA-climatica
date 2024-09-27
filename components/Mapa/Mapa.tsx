import Mapbox from '@rnmapbox/maps';
import { View } from 'react-native';
import { styleRain } from './complements/styles'; 
import Circle from './complements/circle';

// Configura tu token de acceso de Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZmVhdGhlcmVkc25ha2UiLCJhIjoiY20xMTVnNDdyMHBodTJub3JjZmdvbHcyMSJ9.jsOifa5cHHAD8JobUX2Wfg');

const locations = [
  { id: 'circle-guadalajara', coordinates: [-103.3396, 20.6672] },
  { id: 'circle-zapopan', coordinates: [-103.3848, 20.7236] },
  { id: 'circle-tlaquepaque', coordinates: [-103.3117, 20.6406] },
];

// Componente que contiene el círculo en una ubicación específica
const CircleInLocation = () => {
  return (
    <View style={styleRain.circleContainer}>
      <Circle />
    </View>
  );
};

const App = () => {
  return (
    <View style={styleRain.page}>
      <Mapbox.MapView style={styleRain.map}>
        <Mapbox.Camera
          centerCoordinate={locations[0].coordinates} // Centra la cámara en la primera ubicación
          zoomLevel={11}
        />

        {locations.map(location => (
          <Mapbox.PointAnnotation
            key={location.id}
            id={location.id}
            coordinate={location.coordinates}
          >
            <CircleInLocation />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>
    </View>
  );
};

export default App;