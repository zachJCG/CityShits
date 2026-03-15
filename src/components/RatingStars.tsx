import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
}

export function RatingStars({ value, onChange, size = 28, label }: RatingStarsProps) {
  const interactive = !!onChange;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(value);
          const StarWrapper = interactive ? TouchableOpacity : View;
          return (
            <StarWrapper
              key={star}
              onPress={interactive ? () => onChange!(star) : undefined}
              style={styles.star}
            >
              <Text style={{ fontSize: size, opacity: filled ? 1 : 0.3 }}>
                {filled ? '💩' : '💩'}
              </Text>
            </StarWrapper>
          );
        })}
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brown,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  value: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brownLight,
  },
});
