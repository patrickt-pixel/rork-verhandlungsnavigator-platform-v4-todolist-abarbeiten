import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  FlatList
} from 'react-native';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import { FileStorageService } from '@/lib/supabase-service';

interface DocumentItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  type: string;
}

interface DocumentUploadProps {
  userId: string;
  documents: DocumentItem[];
  onDocumentsChange: (documents: DocumentItem[]) => void;
  maxDocuments?: number;
  allowedTypes?: string[];
  title?: string;
}

export default function DocumentUpload({
  userId,
  documents,
  onDocumentsChange,
  maxDocuments = 10,
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  title = 'Documents'
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState<boolean>(false);

  const pickDocument = async () => {
    try {
      if (documents.length >= maxDocuments) {
        Alert.alert(
          'Limit Reached',
          `You can only upload up to ${maxDocuments} documents.`
        );
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await uploadDocument(asset);
      }
    } catch (error) {
      console.log('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadDocument = async (asset: DocumentPicker.DocumentPickerAsset) => {
    try {
      setUploading(true);

      const fileData = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream'
      };

      const metadata = {
        title: asset.name,
        description: `Uploaded on ${new Date().toLocaleDateString()}`
      };

      const { data, error } = await FileStorageService.uploadDocument(
        userId,
        fileData,
        metadata
      );

      if (error) {
        Alert.alert('Upload Error', error.message || 'Failed to upload document');
        return;
      }

      if (data) {
        const newDocument: DocumentItem = {
          id: Date.now().toString(),
          name: asset.name,
          url: data.url,
          size: asset.size || 0,
          uploadedAt: new Date().toISOString(),
          type: asset.mimeType || 'application/octet-stream'
        };

        const updatedDocuments = [...documents, newDocument];
        onDocumentsChange(updatedDocuments);
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, documentPath?: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // If we have the storage path, delete from storage
              if (documentPath) {
                await FileStorageService.deleteFile(
                  FileStorageService.BUCKETS.DOCUMENTS,
                  documentPath
                );
              }

              const updatedDocuments = documents.filter(doc => doc.id !== documentId);
              onDocumentsChange(updatedDocuments);
              Alert.alert('Success', 'Document deleted successfully!');
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (type: string) => {
    return <FileText size={20} color={COLORS.primary} />;
  };

  const renderDocument = ({ item }: { item: DocumentItem }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        {getFileIcon(item.type)}
        <View style={styles.documentDetails}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.documentMeta}>
            {formatFileSize(item.size)} • {formatDate(item.uploadedAt)}
          </Text>
        </View>
      </View>
      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Open document (would need a document viewer)
            Alert.alert('View Document', 'Document viewer not implemented yet');
          }}
          testID={`view-document-${item.id}`}
        >
          <Eye size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteDocument(item.id)}
          testID={`delete-document-${item.id}`}
        >
          <Trash2 size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {documents.length} of {maxDocuments} documents
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          (uploading || documents.length >= maxDocuments) && styles.uploadButtonDisabled
        ]}
        onPress={pickDocument}
        disabled={uploading || documents.length >= maxDocuments}
        testID="upload-document-button"
      >
        {uploading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Upload size={20} color={COLORS.primary} />
        )}
        <Text style={styles.uploadButtonText}>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Text>
      </TouchableOpacity>

      {documents.length > 0 && (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          style={styles.documentsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {documents.length === 0 && !uploading && (
        <View style={styles.emptyState}>
          <FileText size={48} color={COLORS.textLight} />
          <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload documents to share with your consultant
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
    borderColor: COLORS.textLight,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  documentsList: {
    flex: 1,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});