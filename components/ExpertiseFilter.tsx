import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

interface ExpertiseFilterProps {
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string | null) => void;
  testID?: string;
}

export const ExpertiseFilter: React.FC<ExpertiseFilterProps> = ({ 
  options,
  selectedOption,
  onSelect,
  testID 
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedOption ? (
          <TouchableOpacity
            style={[styles.chip, styles.selectedChip]}
            onPress={() => onSelect(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectedChipText}>{selectedOption}</Text>
            <X size={16} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.chip, styles.allChip]}
            onPress={() => onSelect(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.allChipText}>Alle Fachgebiete</Text>
          </TouchableOpacity>
        )}
        
        {options.map((option) => (
          option !== selectedOption && (
            <TouchableOpacity
              key={option}
              style={styles.chip}
              onPress={() => onSelect(option)}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{option}</Text>
            </TouchableOpacity>
          )
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  allChip: {
    backgroundColor: COLORS.backgroundGray,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  selectedChipText: {
    fontSize: 14,
    color: COLORS.white,
    marginRight: 4,
  },
  allChipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});