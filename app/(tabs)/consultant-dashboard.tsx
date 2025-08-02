import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/hooks/auth-store';
import { useBookings } from '@/hooks/booking-store';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/EmptyState';
import { COLORS } from '@/constants/colors';
import { Calendar, Clock, Users, TrendingUp, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ConsultantDashboardScreen() {
  const { user } = useAuth();
  const { getUserBookings, isLoading } = useBookings();

  const bookings = getUserBookings();
  const upcomingBookings = bookings
    .filter(booking => booking.status === 'confirmed')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 2);

  const completedBookingsCount = bookings.filter(booking => booking.status === 'completed').length;

  const handleViewAllBookings = () => {
    router.push('/consultant-bookings');
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={[COLORS.backgroundPurple, COLORS.backgroundLight]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hallo, {user.name.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Willkommen in Ihrem Berater-Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.avatarButton}
            >
              <Image
                source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { backgroundColor: COLORS.cardBlue }]}>
          <View style={styles.statIcon}>
            <Calendar size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statNumber}>{upcomingBookings.length}</Text>
          <Text style={styles.statLabel}>Anstehend</Text>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: COLORS.cardGreen }]}>
          <View style={styles.statIcon}>
            <Clock size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.statNumber}>{completedBookingsCount}</Text>
          <Text style={styles.statLabel}>Abgeschlossen</Text>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, { backgroundColor: COLORS.cardPurple }]}>
          <View style={styles.statIcon}>
            <Users size={24} color={COLORS.gradientPurple} />
          </View>
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Gesamt</Text>
        </Animated.View>
      </View>

      {/* Upcoming Appointments */}
      <Animated.View entering={FadeInRight.delay(400)} style={styles.appointmentsCard}>
        <Text style={styles.sectionTitle}>Anstehende Termine</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>Termine werden geladen...</Text>
        ) : upcomingBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Keine anstehenden Termine</Text>
            <Text style={styles.emptySubtitle}>Sie haben derzeit keine anstehenden Beratungstermine.</Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {upcomingBookings.slice(0, 3).map((booking) => (
              <TouchableOpacity key={booking.id} style={styles.appointmentItem}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.timeText}>{new Date(booking.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.clientName}>{booking.clientName}</Text>
                  <Text style={styles.appointmentType}>Beratungstermin</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.statusText}>Bestätigt</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Consultant Tip */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.tipCard}
      >
        <View style={styles.tipIcon}>
          <TrendingUp size={24} color={COLORS.white} />
        </View>
        <Text style={styles.tipTitle}>💡 Berater-Tipp</Text>
        <Text style={styles.tipText}>
          Planen Sie regelmäßig neue Verfügbarkeiten in Ihrem Kalender ein, um mehr Buchungen zu erhalten. Klienten suchen oft nach kurzfristigen Terminen.
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  appointmentsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 16,
  },
  appointmentTime: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  tipCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
});