import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Text
} from 'react-native';
import { Send, Paperclip, Image, FileText, X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { FileStorageService } from '@/lib/supabase-service';

interface ChatInputProps {
  onSend: (message: string, attachment?: { url: string; type: string; name: string; size: number }) => void;
  placeholder?: string;
  testID?: string;
  bookingId: string;
  senderId: string;
}

interface AttachmentPreview {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend,
  placeholder = 'Type a message...',
  testID,
  bookingId,
  senderId
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState<boolean>(false);

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    try {
      let attachmentData = null;

      if (attachment) {
        setUploading(true);
        
        const fileData = {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.type
        };

        const { data, error } = await FileStorageService.uploadChatAttachment(
          bookingId,
          senderId,
          fileData
        );

        if (error) {
          Alert.alert('Upload Error', error.message || 'Failed to upload attachment');
          setUploading(false);
          return;
        }

        if (data) {
          attachmentData = {
            url: data.url,
            type: data.type,
            name: attachment.name,
            size: data.size
          };
        }
      }

      onSend(message.trim() || '📎 Attachment', attachmentData);
      setMessage('');
      setAttachment(null);
      setUploading(false);
    } catch (error) {
      console.log('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      console.log('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (type: string): boolean => {
    return type.startsWith('image/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {attachment && (
        <View style={styles.attachmentPreview}>
          <View style={styles.attachmentInfo}>
            {isImage(attachment.type) ? (
              <Image size={16} color={COLORS.primary} />
            ) : (
              <FileText size={16} color={COLORS.primary} />
            )}
            <View style={styles.attachmentDetails}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
              {attachment.size && (
                <Text style={styles.attachmentSize}>
                  {formatFileSize(attachment.size)}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeAttachment}
            onPress={removeAttachment}
            testID="remove-attachment"
          >
            <X size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}
      
      {showAttachmentOptions && (
        <View style={styles.attachmentOptions}>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={pickImage}
            testID="pick-image"
          >
            <Image size={20} color={COLORS.primary} />
            <Text style={styles.attachmentOptionText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={pickDocument}
            testID="pick-document"
          >
            <FileText size={20} color={COLORS.primary} />
            <Text style={styles.attachmentOptionText}>Document</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.container} testID={testID}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
          testID="attachment-button"
        >
          <Paperclip size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!message.trim() && !attachment) && styles.disabledButton
          ]} 
          onPress={handleSend}
          disabled={(!message.trim() && !attachment) || uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Send size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: 8,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  attachmentSize: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  removeAttachment: {
    padding: 4,
  },
  attachmentOptions: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
  },
  attachmentOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});