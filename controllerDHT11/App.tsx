import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import useWebSocket from 'react-native-use-websocket';

export default function ClimateMonitor() {
  const [temp, setTemp] = useState<number>(0);
  const [hum, setHum] = useState<number>(0);
  const [connected, setConnected] = useState(false);
  
  const pulseAnim = new Animated.Value(0);
  const rotateAnim = new Animated.Value(0);
  const wsUrl = 'ws://192.168.191.225:81';

  // Animación continua
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const { lastMessage } = useWebSocket(wsUrl, {
    onOpen: () => setConnected(true),
    onError: () => setConnected(false),
    shouldReconnect: () => true,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastMessage?.data) {
      const [temperature, humidity] = lastMessage.data.split(',').map(parseFloat);
      setTemp(temperature);
      setHum(humidity);
    }
  }, [lastMessage]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  const rotateInterp = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getTempColor = (t: number) => {
    if (t < 10) return '#00FFFF';
    if (t < 25) return '#00FFAA';
    if (t < 30) return '#FFFF00';
    return '#FF3300';
  };

  return (
    <View style={styles.container}>
      {/* Fondo de partículas */}
      <Animated.View style={[styles.particle, {
        transform: [{ rotate: rotateInterp }],
        opacity: 0.15
      }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CLIMATE MONITOR</Text>
        <View style={[styles.status, { backgroundColor: connected ? '#0F0' : '#F00' }]} />
      </View>

      {/* Tarjeta de temperatura */}
      <Animated.View style={[styles.card, { 
        transform: [{ scale: pulseScale }],
        borderColor: getTempColor(temp) 
      }]}>
        <Text style={styles.cardLabel}>TEMPERATURA</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: getTempColor(temp) }]}>
            {temp.toFixed(1)}
          </Text>
          <Text style={styles.unit}>°C</Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.tempBar, { 
            width: `${Math.min(100, (temp/40)*100)}%`,
            backgroundColor: getTempColor(temp) 
          }]} />
        </View>
      </Animated.View>

      {/* Tarjeta de humedad */}
      <View style={[styles.card, { borderColor: '#00AAFF' }]}>
        <Text style={styles.cardLabel}>HUMEDAD</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: '#00AAFF' }]}>
            {hum.toFixed(1)}
          </Text>
          <Text style={styles.unit}>%</Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.humBar, { width: `${Math.min(100, hum)}%` }]} />
        </View>
      </View>

      {/* Detalles */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>DHT11 @ ESP32</Text>
        <Text style={styles.footerText}>Actualizado cada 2 segundos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    padding: 20,
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 255, 0.2)',
    top: '20%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginRight: 15,
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#0F0',
    shadowRadius: 5,
    shadowOpacity: 0.8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderWidth: 2,
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 15,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  value: {
    fontSize: 52,
    fontWeight: '300',
  },
  unit: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 24,
    marginLeft: 5,
    marginBottom: 8,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tempBar: {
    height: '100%',
  },
  humBar: {
    height: '100%',
    backgroundColor: '#00AAFF',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginBottom: 5,
  },
});