import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuid } from 'uuid';
import { Colors } from '../../constants/colors';
import { RatingStars } from '../../components/RatingStars';
import { useWebStore } from '../../db/web-store';
import { ReviewPlaceholders } from '../../constants/ratings';

export default function AddScreen() {
  const store = useWebStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [requiresKey, setRequiresKey] = useState(false);
  const [cleanliness, setCleanliness] = useState(3);
  const [privacy, setPrivacy] = useState(3);
  const [soundproofing, setSoundproofing] = useState(3);
  const [comment, setComment] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  const placeholder =
    ReviewPlaceholders[Math.floor(Math.random() * ReviewPlaceholders.length)];

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by your browser.');
      return;
    }
    setLocationStatus('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocationStatus('Location set!');
      },
      (err) => {
        setLocationStatus(`Could not get location: ${err.message}`);
      }
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      window.alert('Every throne needs a name!');
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      window.alert('Please enter valid latitude and longitude, or use "My Location".');
      return;
    }

    const restroomId = uuid();
    const reviewId = uuid();

    store.addRestroom({
      id: restroomId,
      name: name.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      cleanliness,
      privacy,
      soundproofing,
      requires_key: requiresKey,
      access_notes: accessNotes.trim(),
    });

    store.addReview({
      id: reviewId,
      restroom_id: restroomId,
      cleanliness,
      privacy,
      soundproofing,
      comment: comment.trim(),
    });

    window.alert('Throne Added! Your porcelain palace has been mapped for future poopers.');

    // Reset form
    setName('');
    setDescription('');
    setAccessNotes('');
    setRequiresKey(false);
    setCleanliness(3);
    setPrivacy(3);
    setSoundproofing(3);
    setComment('');
    setLatitude('');
    setLongitude('');
    setLocationStatus('');

    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Location */}
      <Text style={styles.sectionTitle}>📍 Location</Text>
      <TouchableOpacity style={styles.locationButton} onPress={useMyLocation}>
        <Text style={styles.locationButtonText}>📍 Use My Location</Text>
      </TouchableOpacity>
      {locationStatus ? <Text style={styles.hint}>{locationStatus}</Text> : null}

      <View style={styles.coordRow}>
        <View style={styles.coordField}>
          <Text style={styles.coordLabel}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={latitude}
            onChangeText={setLatitude}
            placeholder="40.7580"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.coordField}>
          <Text style={styles.coordLabel}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={longitude}
            onChangeText={setLongitude}
            placeholder="-73.9855"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
          />
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
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
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationButton: {
    backgroundColor: Colors.brown,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  locationButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 13,
    color: Colors.brown,
    fontWeight: '600',
    marginBottom: 4,
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
