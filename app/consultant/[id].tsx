import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useConsultants } from '@/hooks/consultant-store';
import { useBookings } from '@/hooks/booking-store';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { ReviewSystem } from '@/components/ReviewSystem';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { Star, Clock, Euro } from 'lucide-react-native';

export default function ConsultantProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConsultantById, isLoading } = useConsultants();
  const { getConsultantTimeSlots, createBooking, isLoading: isBookingLoading } = useBookings();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const consultant = getConsultantById(id);
  const timeSlots = consultant ? getConsultantTimeSlots(consultant.id) : [];
  
  // Mock reviews data - in real app this would come from API
  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Sehr professionelle Beratung. Hat mir sehr geholfen, meine Verhandlungsfähigkeiten zu verbessern.',
      clientName: 'Anna M.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
    },
    {
      id: '2',
      rating: 4,
      comment: 'Kompetent und freundlich. Gute Tipps für schwierige Gespräche.',
      clientName: 'Thomas K.',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
    },
    {
      id: '3',
      rating: 5,
      comment: 'Ausgezeichnete Beratung! Sehr empfehlenswert.',
      clientName: 'Maria S.',
      createdAt: new Date(Date.now() - 86400000 * 21).toISOString(), // 3 weeks ago
    },
  ];

  const handleBooking = async () => {
    if (!consultant || !selectedSlotId) return;

    try {
      await createBooking(selectedSlotId, consultant.id, consultant.name);
      setIsBookingSuccess(true);
      Alert.alert(
        'Buchung erfolgreich',
        'Ihr Termin wurde erfolgreich gebucht. Sie können den Termin in Ihrem Kalender einsehen.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Buchung fehlgeschlagen',
        error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading || !consultant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image 
          source={{ uri: consultant.avatar }} 
          style={styles.avatar} 
          resizeMode="cover"
        />
        <Text style={styles.name}>{consultant.name}</Text>
        <View style={styles.ratingContainer}>
          <Star size={18} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.rating}>
            {consultant.rating.toFixed(1)} ({consultant.reviewCount} Bewertungen)
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Über mich</Text>
        <Text style={styles.bio}>{consultant.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fachgebiete</Text>
        <View style={styles.tagsContainer}>
          {consultant.expertise.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Clock size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>60 Minuten pro Sitzung</Text>
          </View>
          <View style={styles.detailItem}>
            <Euro size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>{consultant.hourlyRate}€ pro Stunde</Text>
          </View>
        </View>
      </View>

      <ReviewSystem
        consultantId={consultant.id}
        reviews={mockReviews}
        canReview={false} // Set to true after booking completion
        onSubmitReview={async (rating, comment) => {
          // This would submit to API
          console.log('Review submitted:', { rating, comment });
        }}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verfügbare Termine</Text>
        <TimeSlotPicker
          timeSlots={timeSlots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
        />
      </View>

      <View style={styles.bookingSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Preis:</Text>
          <Text style={styles.price}>{consultant.hourlyRate}€</Text>
        </View>
        <Button
          title={isBookingSuccess ? "Termin gebucht" : "Termin buchen"}
          onPress={handleBooking}
          isLoading={isBookingLoading}
          disabled={!selectedSlotId || isBookingSuccess}
          style={styles.bookButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  bookingSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1,
    marginLeft: 16,
  },
});