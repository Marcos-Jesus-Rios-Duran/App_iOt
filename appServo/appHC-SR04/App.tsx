import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function EnvironmentalMonitor() {
  const ws = useRef<WebSocket | null>(null);
  const [temperature, setTemperature] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [distance, setDistance] = useState('--');
  const [connected, setConnected] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Determinar color del texto de distancia
  const getDistanceColor = () => {
    const dist = parseFloat(distance);
    if (isNaN(dist)) return '#FFFFFF'; // Color por defecto si no hay dato
    
    if (dist > 50) return '#FFFFFF';  // Blanco
    if (dist > 30) return '#FFEB3B';  // Amarillo
    return '#4CAF50';                 // Verde
  };

  // Animación de conexión
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: connected ? 1 : 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [connected]);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.243.225:81');

    ws.current.onopen = () => {
      console.log("Conexión WebSocket establecida");
      setConnected(true);
    };

    ws.current.onmessage = (e) => {
      if (e.data.startsWith('data:')) {
        const [temp, hum, dist] = e.data.replace('data:', '').split(',');
        setTemperature(temp);
        setHumidity(hum);
        setDistance(dist);
      }
    };

    ws.current.onerror = () => setConnected(false);
    ws.current.onclose = () => setConnected(false);

    return () => {
      ws.current?.close();
    };
  }, []);

  const getData = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send('getData');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>MONITOR AMBIENTAL</Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: connected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {connected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.dataRow}>
            <Text style={styles.dataIcon}>🌡️</Text>
            <Text style={styles.dataLabel}>Temperatura:</Text>
            <Text style={styles.dataValue}>{temperature}°C</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataIcon}>💧</Text>
            <Text style={styles.dataLabel}>Humedad:</Text>
            <Text style={styles.dataValue}>{humidity}%</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataIcon}>📏</Text>
            <Text style={styles.dataLabel}>Distancia:</Text>
            <Text style={[styles.distanceValue, { color: getDistanceColor() }]}>
              {distance} cm
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={getData}
          disabled={!connected}
        >
          <Text style={styles.buttonText}>ACTUALIZAR DATOS</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dataCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dataIcon: {
    fontSize: 20,
    marginRight: 15,
    color: '#FFFFFF',
  },
  dataLabel: {
    color: '#B0B0B0',
    fontSize: 16,
    flex: 1,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});