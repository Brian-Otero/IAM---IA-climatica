import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Configura tu token de acceso de Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZmVhdGhlcmVkc25ha2UiLCJhIjoiY20xMTVnNDdyMHBodTJub3JjZmdvbHcyMSJ9.jsOifa5cHHAD8JobUX2Wfg');

const App = () => {
  // Coordenadas aproximadas del centro de la zona metropolitana de Guadalajara
  const guadalajaraCoordinates = [-103.3396, 20.6672]; // [longitud, latitud]

  return (
    <View style={styles.page}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          centerCoordinate={guadalajaraCoordinates} // Centrar en Guadalajara
          zoomLevel={11}  // Ajusta el nivel de zoom para abarcar la zona metropolitana
        />
        {/* Puedes agregar otros componentes de mapa aquí si es necesario */}
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
    flex: 1,  // Ocupa todo el espacio disponible
  },
});
