import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '@/constants/colors';
import { AlertTriangle, X } from 'lucide-react-native';
import { Button } from './Button';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
  testID?: string;
}

const { width } = Dimensions.get('window');

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  onConfirm,
  onCancel,
  type = 'warning',
  testID = 'confirmation-dialog'
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
        return COLORS.info;
      default:
        return COLORS.warning;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'primary' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <AlertTriangle size={32} color={getIconColor()} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              style={styles.button}
              testID={`${testID}-cancel`}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={getConfirmButtonVariant()}
              style={styles.button}
              testID={`${testID}-confirm`}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});