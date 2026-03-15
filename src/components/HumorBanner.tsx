import { View, Text, StyleSheet } from 'react-native';
import { useHumorMode } from '../context/HumorContext';
import { getRandomNarration, HumorNarrations } from '../constants/humor';
import { Colors } from '../constants/colors';
import { useState, useEffect } from 'react';

interface HumorBannerProps {
  screen: keyof typeof HumorNarrations;
}

export function HumorBanner({ screen }: HumorBannerProps) {
  const { humorMode } = useHumorMode();
  const [narration, setNarration] = useState('');

  useEffect(() => {
    setNarration(getRandomNarration(screen));
  }, [screen]);

  if (!humorMode || !narration) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎙️ {narration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brownLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    borderRadius: 0,
  },
  text: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
