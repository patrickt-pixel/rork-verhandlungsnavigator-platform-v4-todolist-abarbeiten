import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { Consultant } from '@/types';
import { router } from 'expo-router';

interface ConsultantCardProps {
  consultant: Consultant;
  testID?: string;
}

export const ConsultantCard: React.FC<ConsultantCardProps> = ({ 
  consultant,
  testID 
}) => {
  const handlePress = () => {
    router.push(`/consultant/${consultant.id}` as any);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      testID={testID}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: consultant.avatar }} 
          style={styles.avatar} 
          resizeMode="cover"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{consultant.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
            <Text style={styles.rating}>
              {consultant.rating.toFixed(1)} ({consultant.reviewCount})
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {consultant.bio}
      </Text>

      <View style={styles.tagsContainer}>
        {consultant.expertise.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>
          €{consultant.hourlyRate}/Stunde
        </Text>
      </View>
    </TouchableOpacity>
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
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});