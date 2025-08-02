import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text
} from 'react-native';
import { Camera, Upload, User } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { FileStorageService } from '@/lib/supabase-service';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userId: string;
  onUploadComplete: (imageUrl: string) => void;
  size?: number;
  showUploadButton?: boolean;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  userId,
  onUploadComplete,
  size = 120,
  showUploadButton = true
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setLocalImageUri(asset.uri);
        await uploadImage(asset);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setLocalImageUri(asset.uri);
        await uploadImage(asset);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);

      const fileData = {
        uri: asset.uri,
        name: asset.fileName || `profile_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg'
      };

      const { data, error } = await FileStorageService.uploadProfilePicture(
        userId,
        fileData
      );

      if (error) {
        Alert.alert('Upload Error', error.message || 'Failed to upload profile picture');
        setLocalImageUri(null);
        return;
      }

      if (data) {
        onUploadComplete(data.url);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
      setLocalImageUri(null);
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  const imageSource = localImageUri || currentImageUrl;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
        onPress={showImageOptions}
        disabled={uploading}
        testID="profile-picture-container"
      >
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={[
              styles.image,
              { width: size, height: size, borderRadius: size / 2 }
            ]}
            testID="profile-picture"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 }
            ]}
          >
            <User size={size * 0.4} color={COLORS.textLight} />
          </View>
        )}
        
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
          </View>
        )}
        
        <View style={styles.cameraIcon}>
          <Camera size={16} color={COLORS.white} />
        </View>
      </TouchableOpacity>
      
      {showUploadButton && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={showImageOptions}
          disabled={uploading}
          testID="upload-button"
        >
          <Upload size={16} color={COLORS.primary} />
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    backgroundColor: COLORS.backgroundLight,
  },
  placeholder: {
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});