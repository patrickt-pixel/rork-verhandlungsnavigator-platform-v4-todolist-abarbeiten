import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useBookings } from '@/hooks/booking-store';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { ArrowLeft, Plus, Calendar, Clock, Trash2, Edit } from 'lucide-react-native';
import { TimeSlot } from '@/types';

interface TimeSlotItemProps {
  slot: TimeSlot;
  onEdit: (slot: TimeSlot) => void;
  onDelete: (slotId: string) => void;
}

const TimeSlotItem: React.FC<TimeSlotItemProps> = ({ slot, onEdit, onDelete }) => {
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

  const handleDelete = () => {
    Alert.alert(
      'Zeitslot löschen',
      'Möchten Sie diesen Zeitslot wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => onDelete(slot.id)
        }
      ]
    );
  };

  return (
    <View style={[styles.slotItem, slot.isBooked && styles.bookedSlot]}>
      <View style={styles.slotInfo}>
        <View style={styles.slotHeader}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.slotDate}>{formatDate(slot.startTime)}</Text>
        </View>
        <View style={styles.slotTime}>
          <Clock size={16} color={COLORS.textMuted} />
          <Text style={styles.slotTimeText}>
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </Text>
        </View>
        {slot.isBooked && (
          <Text style={styles.bookedText}>Gebucht</Text>
        )}
      </View>
      
      {!slot.isBooked && (
        <View style={styles.slotActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(slot)}
          >
            <Edit size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function TimeSlotsScreen() {
  const { user } = useAuth();
  const { getConsultantTimeSlots, loadConsultantTimeSlots } = useBookings();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.role === 'consultant') {
      loadTimeSlots();
    }
  }, [user]);

  const loadTimeSlots = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await loadConsultantTimeSlots(user.id);
      const slots = getConsultantTimeSlots(user.id);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      Alert.alert('Fehler', 'Zeitslots konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddSlot = () => {
    Alert.alert(
      'Zeitslot hinzufügen',
      'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  const handleEditSlot = (slot: TimeSlot) => {
    Alert.alert(
      'Zeitslot bearbeiten',
      'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      // This would call a delete API
      Alert.alert('Erfolg', 'Zeitslot wurde gelöscht.');
      await loadTimeSlots(); // Refresh the list
    } catch (error) {
      Alert.alert('Fehler', 'Zeitslot konnte nicht gelöscht werden.');
    }
  };

  if (!user || user.role !== 'consultant') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Verfügbarkeit verwalten',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleAddSlot} style={styles.addButton}>
              <Plus size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }} 
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Ihre Verfügbarkeit</Text>
          <Text style={styles.subtitle}>
            Verwalten Sie Ihre verfügbaren Beratungszeiten
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Zeitslots werden geladen...</Text>
          </View>
        ) : timeSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={COLORS.textLighter} />
            <Text style={styles.emptyTitle}>Keine Zeitslots verfügbar</Text>
            <Text style={styles.emptyMessage}>
              Fügen Sie Zeitslots hinzu, damit Klienten Termine buchen können.
            </Text>
            <Button
              title="Ersten Zeitslot hinzufügen"
              onPress={handleAddSlot}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={timeSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TimeSlotItem
                slot={item}
                onEdit={handleEditSlot}
                onDelete={handleDeleteSlot}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          title="Neuen Zeitslot hinzufügen"
          onPress={handleAddSlot}
          style={styles.addSlotButton}
          icon={<Plus size={20} color={COLORS.white} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  listContent: {
    padding: 16,
  },
  slotItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookedSlot: {
    backgroundColor: COLORS.backgroundLight,
    opacity: 0.7,
  },
  slotInfo: {
    flex: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTimeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  bookedText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: 4,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  addSlotButton: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
});