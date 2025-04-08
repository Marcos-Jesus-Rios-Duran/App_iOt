import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

export default function NeonServoControl() {
  const ws = useRef<WebSocket | null>(null);
  const [servoAngle, setServoAngle] = useState(90);
  const [connected, setConnected] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Animaciones compatibles
  useEffect(() => {
    // Animación de glow (sin shadowColor)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Animación de conexión
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: connected ? 3000 : 1000,
          useNativeDriver: false, // Importante para efectos de sombra
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: connected ? 3000 : 1000,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [connected]);

  // Conexión WebSocket mejorada
  useEffect(() => {
    const wsUrl = 'ws://192.168.243.225:81';
    console.log('Intentando conectar a:', wsUrl);
    
    ws.current = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log('Conexión WebSocket establecida');
      setConnected(true);
      // Enviar mensaje de prueba
      ws.current?.send('ping');
    };

    const handleMessage = (e: MessageEvent) => {
      console.log('Mensaje recibido:', e.data);
    };

    const handleError = (e: Event) => {
      console.log('Error WebSocket:', e);
      setConnected(false);
    };

    const handleClose = () => {
      console.log('Conexión WebSocket cerrada');
      setConnected(false);
    };

    ws.current.addEventListener('open', handleOpen);
    ws.current.addEventListener('message', handleMessage);
    ws.current.addEventListener('error', handleError);
    ws.current.addEventListener('close', handleClose);

    return () => {
      ws.current?.removeEventListener('open', handleOpen);
      ws.current?.removeEventListener('message', handleMessage);
      ws.current?.removeEventListener('error', handleError);
      ws.current?.removeEventListener('close', handleClose);
      ws.current?.close();
    };
  }, []);

  const moveServo = (angle: number) => {
    const newAngle = Math.round(angle);
    setServoAngle(newAngle);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(`servo:${newAngle}`);
    }
  };

  const presetAngle = (angle: number) => moveServo(angle);

  // Interpolaciones seguras
  const pulseColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff0a54', connected ? '#00f5d4' : '#ff206e']
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1]
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.title, {
          opacity: glowOpacity,
          textShadowColor: Platform.OS === 'ios' ? '#00f5d4' : undefined,
          textShadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0 } : undefined,
          textShadowRadius: Platform.OS === 'ios' ? 10 : undefined,
        }]}>
          SERVO NEON CONTROL
        </Animated.Text>
        
        <View style={styles.connectionStatus}>
          <Animated.View style={[styles.statusIndicator, { 
            backgroundColor: pulseColor,
            // Shadow solo aplica cuando useNativeDriver es false
            ...(Platform.OS === 'android' && {
              elevation: 8,
              shadowColor: '#00f5d4'
            })
          }]} />
          <Text style={styles.statusText}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* Panel de control */}
      <Animated.View style={[styles.controlPanel, {
        borderColor: '#00f5d4',
        opacity: glowOpacity,
        ...(Platform.OS === 'android' && {
          elevation: 10,
          shadowColor: '#00f5d4'
        })
      }]}>
        {/* Botones de posición */}
        <View style={styles.presetButtons}>
          {[0, 90, 180].map((angle) => (
            <TouchableOpacity
              key={angle}
              style={[styles.presetButton, {
                backgroundColor: angle === 0 ? '#ff206e' : 
                                angle === 90 ? '#00f5d4' : '#8338ec',
                ...(Platform.OS === 'android' && {
                  elevation: 5,
                  shadowColor: '#00f5d4'
                })
              }]}
              onPress={() => presetAngle(angle)}
            >
              <Text style={styles.buttonText}>{angle}°</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Control deslizante */}
        <View style={styles.sliderContainer}>
          <Animated.Text style={[styles.angleText, {
            textShadowColor: Platform.OS === 'ios' ? '#00f5d4' : undefined,
            textShadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0 } : undefined,
            textShadowRadius: Platform.OS === 'ios' ? 5 : undefined,
          }]}>
            ANGLE: {servoAngle}°
          </Animated.Text>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={180}
            step={1}
            value={servoAngle}
            onValueChange={moveServo}
            minimumTrackTintColor="#8338ec"
            maximumTrackTintColor="#3a0ca3"
            thumbTintColor="#00f5d4"
          />
          
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: '#ff206e' }]}>0°</Text>
            <Text style={[styles.sliderLabel, { color: '#00f5d4' }]}>90°</Text>
            <Text style={[styles.sliderLabel, { color: '#8338ec' }]}>180°</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#00f5d4',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
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
    shadowOpacity: 1,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  controlPanel: {
    backgroundColor: 'rgba(0, 10, 20, 0.7)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.7,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  presetButton: {
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.7,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  angleText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});