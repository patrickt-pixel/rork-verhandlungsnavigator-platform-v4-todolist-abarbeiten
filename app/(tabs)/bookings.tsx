import React from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useBookings } from '@/hooks/booking-store';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/EmptyState';
import { COLORS } from '@/constants/colors';
import { Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

export default function BookingsScreen() {
  const { getUserBookings, isLoading } = useBookings();
  
  const bookings = getUserBookings().sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const handleFindConsultants = () => {
    router.push('/search');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.header}>Ihre Beratungstermine</Text>
          }
        />
      ) : (
        <EmptyState
          title="Keine Termine gefunden"
          message="Sie haben noch keine Beratungstermine gebucht."
          buttonTitle="Berater finden"
          onButtonPress={handleFindConsultants}
          icon={<Calendar size={40} color={COLORS.textLighter} />}
        />
      )}
    </View>
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
  listContent: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
});