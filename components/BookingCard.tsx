import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Calendar, MessageCircle, MoreVertical, X, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { Booking } from '@/types';
import { router } from 'expo-router';
import { useBookings } from '@/hooks/booking-store';
import { useToast } from '@/hooks/toast-store';
import { ConfirmationDialog } from './ConfirmationDialog';

interface BookingCardProps {
  booking: Booking;
  isConsultant?: boolean;
  testID?: string;
  onStatusUpdate?: (bookingId: string, newStatus: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ 
  booking,
  isConsultant = false,
  testID,
  onStatusUpdate 
}) => {
  const [showActions, setShowActions] = useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const { cancelBooking } = useBookings();
  const { showSuccess, showError, showInfo } = useToast();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Storniert';
      default:
        return 'Ausstehend';
    }
  };

  const handleChatPress = () => {
    router.push(`/chat/${booking.id}` as any);
  };

  const handleMorePress = () => {
    setShowActions(!showActions);
  };

  const handleCancelBooking = () => {
    setShowActions(false);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    try {
      await cancelBooking(booking.id);
      onStatusUpdate?.(booking.id, 'cancelled');
      showSuccess('Termin wurde erfolgreich storniert');
      setShowCancelDialog(false);
    } catch (error) {
      showError('Termin konnte nicht storniert werden');
      console.error('Cancel booking error:', error);
    }
  };

  const handleRescheduleBooking = () => {
    setShowActions(false);
    showInfo('Diese Funktion wird in einer zukünftigen Version verfügbar sein.');
  };

  const canModifyBooking = () => {
    const bookingDate = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'confirmed' && hoursUntilBooking > 24;
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Calendar size={18} color={COLORS.primary} />
        <Text style={styles.date}>
          {formatDate(booking.startTime)}, {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {isConsultant ? 'Klient: ' : 'Berater: '}
          <Text style={styles.name}>
            {isConsultant ? booking.clientName : booking.consultantName}
          </Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>

        <View style={styles.actions}>
          {(booking.status === 'confirmed' || booking.status === 'completed') && (
            <TouchableOpacity 
              style={styles.chatButton} 
              onPress={handleChatPress}
              activeOpacity={0.8}
            >
              <MessageCircle size={18} color={COLORS.white} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          )}
          
          {canModifyBooking() && (
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={handleMorePress}
              activeOpacity={0.8}
            >
              <MoreVertical size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showActions && canModifyBooking() && (
        <View style={styles.actionMenu}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleRescheduleBooking}
            activeOpacity={0.8}
            testID={`${testID}-reschedule`}
          >
            <RefreshCw size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Verschieben</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleCancelBooking}
            activeOpacity={0.8}
            testID={`${testID}-cancel`}
          >
            <X size={16} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Stornieren</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationDialog
        visible={showCancelDialog}
        title="Termin stornieren"
        message="Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Stornieren"
        cancelText="Abbrechen"
        onConfirm={confirmCancelBooking}
        onCancel={() => setShowCancelDialog(false)}
        type="danger"
        testID={`${testID}-cancel-dialog`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: COLORS.text,
  },
  name: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chatButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
    borderRadius: 12,
  },
  actionMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});