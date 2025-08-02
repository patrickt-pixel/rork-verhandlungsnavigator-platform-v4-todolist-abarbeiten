import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  testID?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  timeSlots,
  selectedSlotId,
  onSelectSlot,
  testID 
}) => {
  // Group time slots by date
  const groupedSlots = timeSlots.reduce((groups, slot) => {
    const date = new Date(slot.startTime).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, TimeSlot[]>);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (timeSlots.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>
          Keine verfügbaren Termine gefunden.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(groupedSlots).map(([date, slots]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Calendar size={18} color={COLORS.primary} />
              <Text style={styles.dateText}>{date}</Text>
            </View>
            
            <View style={styles.slotsContainer}>
              {slots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotButton,
                    selectedSlotId === slot.id && styles.selectedSlot
                  ]}
                  onPress={() => onSelectSlot(slot.id)}
                  activeOpacity={0.8}
                >
                  <Clock 
                    size={16} 
                    color={selectedSlotId === slot.id ? COLORS.white : COLORS.primary} 
                  />
                  <Text 
                    style={[
                      styles.slotText,
                      selectedSlotId === slot.id && styles.selectedSlotText
                    ]}
                  >
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
  },
  selectedSlotText: {
    color: COLORS.white,
  },
});