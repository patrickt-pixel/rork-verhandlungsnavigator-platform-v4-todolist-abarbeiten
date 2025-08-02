import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/hooks/auth-store';
import { useConsultants } from '@/hooks/consultant-store';
import { useBookings } from '@/hooks/booking-store';
import { useNotifications } from '@/hooks/notification-store';
import { COLORS } from '@/constants/colors';
import { Calendar, Bell, TrendingUp, Clock, Search, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';



export default function HomeScreen() {
  const { user } = useAuth();
  const { consultants } = useConsultants();
  const { getUserBookings } = useBookings();
  const { unreadCount } = useNotifications();

  const upcomingBookings = getUserBookings()
    .filter(booking => booking.status === 'confirmed')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 2);

  const featuredConsultants = consultants
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  const handleViewAllBookings = () => {
    router.push('/(tabs)/bookings');
  };

  const handleViewAllConsultants = () => {
    router.push('/(tabs)/search');
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
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
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Bell size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.avatarButton}
            >
              <Image
                source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Calendar Card */}
      <Animated.View 
        entering={FadeInDown.delay(100)}
        style={styles.calendarCard}
      >
        <Text style={styles.calendarMonth}>Juli 2025</Text>
        <View style={styles.calendarHeader}>
          <Text style={styles.dayLabel}>Son</Text>
          <Text style={styles.dayLabel}>Mon</Text>
          <Text style={styles.dayLabel}>Die</Text>
          <Text style={styles.dayLabel}>Mit</Text>
          <Text style={styles.dayLabel}>Don</Text>
          <Text style={styles.dayLabel}>Fre</Text>
          <Text style={styles.dayLabel}>Sam</Text>
        </View>
        <View style={styles.calendarDays}>
          {[12, 13, 14, 15, 16, 17, 18].map((day, index) => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayButton, day === 15 && styles.selectedDay]}
            >
              <Text style={[styles.dayText, day === 15 && styles.selectedDayText]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Progress Card */}
      <Animated.View 
        entering={FadeInRight.delay(200)}
        style={styles.progressCard}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressIcon}>
            <TrendingUp size={24} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressSubtitle}>Learning activity</Text>
          </View>
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressPercentage}>67%</Text>
          <Text style={styles.progressBooks}>12 books</Text>
        </View>
      </Animated.View>

      {/* Activity Stats */}
      <Animated.View 
        entering={FadeInDown.delay(300)}
        style={styles.activityCard}
      >
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>My Activity</Text>
          <Text style={styles.activityTime}>40h 32m</Text>
          <Text style={styles.activityPercentage}>84%</Text>
        </View>
        
        <View style={styles.activityChart}>
          <View style={[styles.chartSegment, { backgroundColor: COLORS.activityCompleted, flex: 0.4 }]} />
          <View style={[styles.chartSegment, { backgroundColor: COLORS.activityLearning, flex: 0.25 }]} />
          <View style={[styles.chartSegment, { backgroundColor: COLORS.gradientOrange, flex: 0.2 }]} />
          <View style={[styles.chartSegment, { backgroundColor: COLORS.primary, flex: 0.15 }]} />
        </View>
        
        <View style={styles.activityLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.activityCompleted }]} />
            <Text style={styles.legendText}>40% Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.activityLearning }]} />
            <Text style={styles.legendText}>25% Learning Time</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.gradientOrange }]} />
            <Text style={styles.legendText}>20% Tests Passed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>15% Achievements</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Schnellzugriff</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: COLORS.primary }]}
            onPress={handleSearchPress}
            testID="quick-search-button"
          >
            <Search size={24} color={COLORS.white} />
            <Text style={[styles.quickActionTitle, { color: COLORS.white }]}>Berater suchen</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: COLORS.success }]}
            onPress={handleViewAllBookings}
            testID="quick-bookings-button"
          >
            <Calendar size={24} color={COLORS.white} />
            <Text style={[styles.quickActionTitle, { color: COLORS.white }]}>Meine Termine</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nächste Termine</Text>
            <TouchableOpacity onPress={handleViewAllBookings} testID="view-all-bookings">
              <Text style={styles.viewAllText}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookingsScroll}>
            {upcomingBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingPreviewCard}>
                <Text style={styles.bookingConsultant}>{booking.consultantName}</Text>
                <Text style={styles.bookingTime}>
                  {new Date(booking.startTime).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <View style={[styles.bookingStatus, 
                  { backgroundColor: booking.status === 'confirmed' ? COLORS.success : COLORS.warning }
                ]}>
                  <Text style={styles.bookingStatusText}>
                    {booking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Consultants */}
      {featuredConsultants.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Berater</Text>
            <TouchableOpacity onPress={handleViewAllConsultants} testID="view-all-consultants">
              <Text style={styles.viewAllText}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.consultantsScroll}>
            {featuredConsultants.map((consultant) => (
              <TouchableOpacity 
                key={consultant.id} 
                style={styles.consultantPreviewCard}
                onPress={() => router.push(`/consultant/${consultant.id}`)}
              >
                <Image
                  source={{ uri: consultant.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                  style={styles.consultantAvatar}
                />
                <Text style={styles.consultantName}>{consultant.name}</Text>
                <Text style={styles.consultantExpertise}>{consultant.expertise[0]}</Text>
                <View style={styles.consultantRating}>
                  <Text style={styles.ratingText}>⭐ {consultant.rating.toFixed(1)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* To Do List */}
      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={styles.todoCard}
      >
        <View style={styles.todoHeader}>
          <Text style={styles.todoTitle}>To Do List</Text>
          <View style={styles.avatarGroup}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.miniAvatar, { marginLeft: i > 1 ? -8 : 0 }]} />
            ))}
          </View>
        </View>
        
        <View style={styles.todoStats}>
          <View style={styles.todoStatItem}>
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.todoStatLabel}>All</Text>
            <Text style={styles.todoStatNumber}>29</Text>
          </View>
          <View style={[styles.todoStatItem, styles.scheduledStat]}>
            <Calendar size={16} color={COLORS.text} />
            <Text style={styles.todoStatLabel}>Scheduled</Text>
            <Text style={styles.todoStatNumber}>13</Text>
          </View>
        </View>
        
        <View style={styles.todoStats}>
          <View style={[styles.todoStatItem, styles.activeStat]}>
            <Text style={styles.todoStatLabel}>Active</Text>
            <Text style={styles.todoStatNumber}>9</Text>
          </View>
          <View style={[styles.todoStatItem, styles.overdueStat]}>
            <Text style={styles.todoStatLabel}>Overdue</Text>
            <Text style={styles.todoStatNumber}>4</Text>
          </View>
        </View>
      </Animated.View>

      {/* Motivational Card */}
      <LinearGradient
        colors={[COLORS.gradientPurple, COLORS.gradientPink]}
        style={styles.motivationCard}
      >
        <Text style={styles.motivationTitle}>Bereit für Beratung?</Text>
        <Text style={styles.motivationSubtitle}>Finden Sie Ihren Experten</Text>
        <Text style={styles.motivationText}>💡 Professionelle Beratung. Persönliche Lösungen. Sofortige Hilfe.</Text>
        <TouchableOpacity style={styles.motivationButton} onPress={handleSearchPress}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
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
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.text,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedDayText: {
    color: COLORS.white,
  },
  progressCard: {
    backgroundColor: COLORS.cardBlue,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressBooks: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityTime: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activityChart: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  chartSegment: {
    height: '100%',
  },
  activityLegend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  offersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  offerCard: {
    width: 120,
    height: 80,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  todoCard: {
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
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  todoStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  todoStatItem: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  scheduledStat: {
    backgroundColor: COLORS.gradientYellow,
  },
  activeStat: {
    backgroundColor: COLORS.cardBlue,
  },
  overdueStat: {
    backgroundColor: COLORS.cardPurple,
  },
  todoStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  todoStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  motivationCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  motivationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  motivationSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 20,
  },
  motivationButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookingsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  bookingPreviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingConsultant: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  bookingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  consultantsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  consultantPreviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  consultantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  consultantName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  consultantExpertise: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  consultantRating: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
});