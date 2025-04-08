import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

export default function ServoControl() {
  const ws = useRef(null);
  const [temperature, setTemperature] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [servoAngle, setServoAngle] = useState(90);
  const [connected, setConnected] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Animación de conexión
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: connected ? 2000 : 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: connected ? 2000 : 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [connected]);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.4.1:81');

    ws.current.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      setConnected(true);
    };

    ws.current.onmessage = (e) => {
      if (e.data.startsWith('data:')) {
        const [temp, hum] = e.data.replace('data:', '').split(',');
        setTemperature(temp);
        setHumidity(hum);
      }
    };

    ws.current.onerror = (e) => {
      console.log('Error de conexión:', e);
      setConnected(false);
    };

    ws.current.onclose = () => {
      console.log('Conexión cerrada');
      setConnected(false);
    };

    return () => ws.current.close();
  }, []);

  const getData = () => {
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send('getData');
    }
  };

  const moveServo = (angle) => {
    const newAngle = Math.round(angle);
    setServoAngle(newAngle);
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(`servo:${newAngle}`);
    }
  };

  const presetAngle = (angle) => {
    moveServo(angle);
  };

  const pulseColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF0000', connected ? '#00FF00' : '#FF3333']
  });

  return (
    <View style={styles.container}>
      {/* Header con indicador de conexión */}
      <View style={styles.header}>
        <Text style={styles.title}>CONTROL SERVOMOTOR</Text>
        <View style={styles.connectionStatus}>
          <Animated.View style={[styles.statusIndicator, { 
            backgroundColor: pulseColor,
            shadowColor: pulseColor,
          }]} />
          <Text style={styles.statusText}>
            {connected ? 'CONECTADO' : 'DESCONECTADO'}
          </Text>
        </View>
      </View>

      {/* Tarjeta de datos del sensor */}
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>DATOS DEL SENSOR</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Temperatura:</Text>
          <Text style={styles.dataValue}>{temperature}°C</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Humedad:</Text>
          <Text style={styles.dataValue}>{humidity}%</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={getData}
        >
          <Text style={styles.buttonText}>ACTUALIZAR DATOS</Text>
        </TouchableOpacity>
      </View>

      {/* Control del servomotor */}
      <View style={styles.controlCard}>
        <Text style={styles.controlTitle}>CONTROL SERVO</Text>
        
        {/* Botones de posición predefinida */}
        <View style={styles.presetButtons}>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => presetAngle(0)}
          >
            <Text style={styles.buttonText}>0°</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => presetAngle(90)}
          >
            <Text style={styles.buttonText}>90°</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => presetAngle(180)}
          >
            <Text style={styles.buttonText}>180°</Text>
          </TouchableOpacity>
        </View>

        {/* Control deslizante */}
        <View style={styles.sliderContainer}>
          <Text style={styles.angleText}>Ángulo actual: {servoAngle}°</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={180}
            step={1}
            value={servoAngle}
            onValueChange={moveServo}
            minimumTrackTintColor="#FF5500"
            maximumTrackTintColor="#333333"
            thumbTintColor="#FFAA00"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0°</Text>
            <Text style={styles.sliderLabel}>90°</Text>
            <Text style={styles.sliderLabel}>180°</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: 'rgba(0, 170, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.3)',
  },
  dataTitle: {
    color: '#00AAFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dataLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#00AAFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  controlCard: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  controlTitle: {
    color: '#FFAA00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  presetButton: {
    backgroundColor: '#FF5500',
    borderRadius: 8,
    padding: 15,
    width: '30%',
    alignItems: 'center',
  },
  sliderContainer: {
    marginBottom: 10,
  },
  angleText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});