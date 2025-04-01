import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import useWebSocket from 'react-native-use-websocket';

export default function App() {
  const [brightness, setBrightness] = useState<number>(0);

  // Reemplaza con la IP de tu ESP32
  const wsUrl = 'ws://192.168.191.225:2';

  const { sendMessage, readyState } = useWebSocket(wsUrl, {
    onOpen: () => console.log('Conexión establecida'),
    onError: (e) => console.log('Error:', e),
    shouldReconnect: () => true,
  });

  const handleSendBrightness = (value: number) => {
    const roundedValue = Math.round(value);
    setBrightness(roundedValue);
    if (readyState === 1) { // 1 = OPEN
      sendMessage(roundedValue.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de LED</Text>
      
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={brightness}
        onValueChange={handleSendBrightness}
        minimumTrackTintColor="#1fb28a"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1a9274"
      />
      
      <Text style={styles.valueText}>
        Brillo: {brightness} % | 
        Estado: {readyState === 1 ? 'Conectado' : 'Desconectado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  valueText: {
    fontSize: 18,
    marginTop: 10,
  },
});