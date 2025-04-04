import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import useWebSocket from 'react-native-use-websocket';

const { width } = Dimensions.get('window');

export default function RGBControl() {
  const [color, setColor] = useState({ r: 0, g: 0, b: 0 });
  const [connected, setConnected] = useState(false);

  const wsUrl = 'ws://192.168.191.225:81';

  const { sendMessage, readyState } = useWebSocket(wsUrl, {
    onOpen: () => {
      console.log('Conectado!');
      setConnected(true);
    },
    onError: (e) => {
      console.log('Error al conectar:', e);
      setConnected(false);
    },
    shouldReconnect: () => true,
  });

  const handleColorChange = (value: number, channel: 'r' | 'g' | 'b') => {
    const newColor = { ...color, [channel]: Math.round(value) };
    setColor(newColor);
    
    if (readyState === 1) {
      sendMessage(`${newColor.r},${newColor.g},${newColor.b}`);
    }
  };

  const bgColor = `rgb(${color.r * 2.55}, ${color.g * 2.55}, ${color.b * 2.55})`;

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Indicador de conexión */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {connected ? 'CONECTADO' : 'DESCONECTADO'}
        </Text>
        <View style={[styles.statusLight, { 
          backgroundColor: connected ? '#0F0' : '#F00',
          shadowColor: connected ? '#0F0' : '#F00',
        }]} />
      </View>

      {/* Visualizador del color */}
      <Animated.View style={[styles.ledPreview, {
        backgroundColor: bgColor,
        shadowColor: bgColor,
      }]} />

      {/* Controles deslizantes */}
      <View style={styles.sliderGroup}>
        <Text style={styles.sliderLabel}>ROJO: {color.r}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={color.r}
          onValueChange={(v) => handleColorChange(v, 'r')}
          minimumTrackTintColor="#FF0000"
          thumbTintColor="#FF3333"
        />

        <Text style={styles.sliderLabel}>VERDE: {color.g}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={color.g}
          onValueChange={(v) => handleColorChange(v, 'g')}
          minimumTrackTintColor="#00FF00"
          thumbTintColor="#33FF33"
        />

        <Text style={styles.sliderLabel}>AZUL: {color.b}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={color.b}
          onValueChange={(v) => handleColorChange(v, 'b')}
          minimumTrackTintColor="#0000FF"
          thumbTintColor="#3333FF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    color: '#FFF',
    fontSize: 18,
    marginRight: 10,
    letterSpacing: 1,
  },
  statusLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  ledPreview: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    alignSelf: 'center',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
  },
  sliderGroup: {
    width: '100%',
  },
  sliderLabel: {
    color: '#FFF',
    marginBottom: 5,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 25,
  },
});