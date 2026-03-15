import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { v4 as uuid } from 'uuid';
import { Colors } from '../../constants/colors';
import { RatingStars } from '../../components/RatingStars';
import { addRestroom } from '../../db/restrooms';
import { addReview } from '../../db/reviews';
import { ReviewPlaceholders } from '../../constants/ratings';

export default function AddScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [requiresKey, setRequiresKey] = useState(false);
  const [cleanliness, setCleanliness] = useState(3);
  const [privacy, setPrivacy] = useState(3);
  const [soundproofing, setSoundproofing] = useState(3);
  const [comment, setComment] = useState('');
  const [coordinate, setCoordinate] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [mapRegion, setMapRegion] = useState({
    latitude: 40.758,
    longitude: -73.9855,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const placeholder =
    ReviewPlaceholders[Math.floor(Math.random() * ReviewPlaceholders.length)];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoordinate(coords);
        setMapRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  const handleMapPress = (e: MapPressEvent) => {
    setCoordinate(e.nativeEvent.coordinate);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hold Up! 💩', 'Every throne needs a name!');
      return;
    }
    if (!coordinate) {
      Alert.alert('Where Is It? 📍', 'Tap the map to drop a pin on your throne!');
      return;
    }

    const restroomId = uuid();
    const reviewId = uuid();

    await addRestroom(db, {
      id: restroomId,
      name: name.trim(),
      description: description.trim(),
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      cleanliness,
      privacy,
      soundproofing,
      requires_key: requiresKey,
      access_notes: accessNotes.trim(),
    });

    await addReview(db, {
      id: reviewId,
      restroom_id: restroomId,
      cleanliness,
      privacy,
      soundproofing,
      comment: comment.trim(),
    });

    Alert.alert('Throne Added! 👑', 'Your porcelain palace has been mapped for future poopers.', [
      {
        text: 'View It',
        onPress: () => router.push(`/restroom/${restroomId}`),
      },
      {
        text: 'Back to Map',
        onPress: () => router.replace('/(tabs)'),
      },
    ]);

    // Reset form
    setName('');
    setDescription('');
    setAccessNotes('');
    setRequiresKey(false);
    setCleanliness(3);
    setPrivacy(3);
    setSoundproofing(3);
    setComment('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Map Pin Picker */}
        <Text style={styles.sectionTitle}>📍 Drop Your Pin</Text>
        <Text style={styles.hint}>Tap the map to place your throne</Text>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
          >
            {coordinate && (
              <Marker coordinate={coordinate}>
                <Text style={{ fontSize: 32 }}>🚽</Text>
              </Marker>
            )}
          </MapView>
        </View>

        {/* Name */}
        <Text style={styles.sectionTitle}>🏛️ Throne Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. The Porcelain Palace (Starbucks)"
          placeholderTextColor={Colors.gray}
        />

        {/* Description */}
        <Text style={styles.sectionTitle}>📝 Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="What should fellow poopers know?"
          placeholderTextColor={Colors.gray}
          multiline
          numberOfLines={3}
        />

        {/* Access Info */}
        <Text style={styles.sectionTitle}>🔑 Access Info</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Requires Key/Code?</Text>
          <Switch
            value={requiresKey}
            onValueChange={setRequiresKey}
            trackColor={{ false: Colors.grayLight, true: Colors.brownMuted }}
            thumbColor={requiresKey ? Colors.brown : Colors.gray}
          />
        </View>
        <TextInput
          style={styles.input}
          value={accessNotes}
          onChangeText={setAccessNotes}
          placeholder="e.g. Ask barista, code 1234"
          placeholderTextColor={Colors.gray}
        />

        {/* Ratings */}
        <Text style={styles.sectionTitle}>⭐ Rate This Throne</Text>
        <RatingStars label="🧹 Cleanliness" value={cleanliness} onChange={setCleanliness} />
        <RatingStars label="🚪 Privacy" value={privacy} onChange={setPrivacy} />
        <RatingStars label="🔇 Soundproofing" value={soundproofing} onChange={setSoundproofing} />

        {/* Review */}
        <Text style={styles.sectionTitle}>💬 Your Review</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={comment}
          onChangeText={setComment}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray}
          multiline
          numberOfLines={4}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>💩 Add This Throne!</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brown,
    marginTop: 20,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: Colors.brown,
  },
  submitButton: {
    backgroundColor: Colors.brown,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
