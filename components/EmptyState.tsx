import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { COLORS } from '../constants/colors';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  icon?: React.ReactNode;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title,
  message,
  buttonTitle,
  onButtonPress,
  icon,
  testID 
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});