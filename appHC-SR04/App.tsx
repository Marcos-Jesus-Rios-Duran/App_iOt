import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const WEBSOCKET_URL = 'ws://192.168.243.225:81'; // Reemplaza con la IP del ESP32

export default function App() {
  const [distance, setDistance] = useState(null);
  const [color, setColor] = useState('gray');

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('Conectado al WebSocket');
      socket.send('getData');
    };

    socket.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('data:,')) {
        const dist = parseFloat(message.replace('data:,', ''));
        setDistance(dist);

        // Cambiar color según la distancia
        if (dist < 20) setColor('red');
        else if (dist >= 20 && dist <= 50) setColor('yellow');
        else setColor('green');
      }
    };

    socket.onerror = (error) => {
      console.error('Error WebSocket:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket cerrado');
    };

    // Cerrar socket al desmontar componente
    return () => socket.close();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Distancia:</Text>
      <Text style={styles.distanceText}>
        {distance !== null ? `${distance.toFixed(2)} cm` : 'Esperando...'}
      </Text>
      <View style={[styles.trafficLight, { backgroundColor: color }]} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
  },
  distanceText: {
    fontSize: 22,
    color: '#ddd',
    marginBottom: 40,
  },
  trafficLight: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#fff',
    borderWidth: 3,
  },
});