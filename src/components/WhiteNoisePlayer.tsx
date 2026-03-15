import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type NoiseType = 'white' | 'brown' | 'pink' | 'vader';

const NOISE_OPTIONS: { type: NoiseType; label: string; emoji: string }[] = [
  { type: 'white', label: 'Ocean Waves', emoji: '🌊' },
  { type: 'brown', label: 'Coffee Shop', emoji: '☕' },
  { type: 'pink', label: 'Gentle Rain', emoji: '🌧️' },
  { type: 'vader', label: 'Darth Vader', emoji: '😮‍💨' },
];

export function WhiteNoisePlayer() {
  const [playing, setPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState<NoiseType>('white');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | ScriptProcessorNode | null>(null);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        if ('stop' in sourceRef.current) sourceRef.current.stop();
        if ('disconnect' in sourceRef.current) sourceRef.current.disconnect();
      } catch {}
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(
    (type: NoiseType) => {
      stop();

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const bufferSize = 4096;
        const processor = ctx.createScriptProcessor(bufferSize, 1, 1);

        let lastOut = 0;

        processor.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            switch (type) {
              case 'white':
                output[i] = white * 0.3;
                break;
              case 'brown':
                lastOut = (lastOut + 0.02 * white) / 1.02;
                output[i] = lastOut * 3.0;
                break;
              case 'pink': {
                // Rough pink noise approximation
                lastOut = 0.99886 * lastOut + white * 0.0555179;
                output[i] = lastOut * 0.5;
                break;
              }
              case 'vader':
                // Deep rhythmic breathing
                const t = (e.playbackTime || ctx.currentTime) + i / ctx.sampleRate;
                const breathCycle = Math.sin(t * 0.8 * Math.PI) * 0.5 + 0.5;
                output[i] = white * 0.15 * breathCycle;
                break;
            }
          }
        };

        processor.connect(ctx.destination);
        sourceRef.current = processor;
        setPlaying(true);
        setSelectedType(type);
      } catch {
        // Web Audio not supported
        setPlaying(false);
      }
    },
    [stop]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔇 Stealth Mode</Text>
      <Text style={styles.subtitle}>Mask your... activities</Text>

      <View style={styles.options}>
        {NOISE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={[
              styles.option,
              playing && selectedType === opt.type && styles.optionActive,
            ]}
            onPress={() => {
              if (playing && selectedType === opt.type) {
                stop();
              } else {
                play(opt.type);
              }
            }}
          >
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <Text
              style={[
                styles.optionLabel,
                playing && selectedType === opt.type && styles.optionLabelActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {playing && (
        <TouchableOpacity style={styles.stopButton} onPress={stop}>
          <Text style={styles.stopText}>⏹ Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brown,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    backgroundColor: Colors.background,
  },
  optionActive: {
    borderColor: Colors.brown,
    backgroundColor: Colors.brownSurface,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  optionLabelActive: {
    color: Colors.brown,
  },
  stopButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: 'center',
  },
  stopText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
