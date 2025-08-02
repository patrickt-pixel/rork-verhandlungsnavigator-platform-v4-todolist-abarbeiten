import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { Button } from './Button';

interface Review {
  id: string;
  rating: number;
  comment: string;
  clientName: string;
  createdAt: string;
}

interface ReviewSystemProps {
  consultantId: string;
  reviews: Review[];
  canReview?: boolean;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  testID?: string;
}

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 20, 
  readonly = false 
}) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          style={styles.starButton}
        >
          <Star
            size={size}
            color={star <= rating ? COLORS.warning : COLORS.border}
            fill={star <= rating ? COLORS.warning : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  consultantId,
  reviews,
  canReview = false,
  onSubmitReview,
  testID
}) => {
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const handleSubmitReview = async () => {
    if (!onSubmitReview) return;

    if (newComment.trim().length < 10) {
      Alert.alert('Fehler', 'Bitte geben Sie eine aussagekräftige Bewertung ein (mindestens 10 Zeichen).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview(newRating, newComment.trim());
      setShowReviewModal(false);
      setNewRating(5);
      setNewComment('');
      Alert.alert('Erfolg', 'Ihre Bewertung wurde erfolgreich abgegeben.');
    } catch (error) {
      Alert.alert('Fehler', 'Bewertung konnte nicht abgegeben werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Rating Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Bewertungen</Text>
          {canReview && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={styles.addReviewText}>Bewerten</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {reviews.length > 0 ? (
          <View style={styles.ratingOverview}>
            <View style={styles.averageRating}>
              <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
              <StarRating rating={Math.round(averageRating)} size={16} readonly />
              <Text style={styles.reviewCount}>({reviews.length} Bewertungen)</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noReviewsText}>Noch keine Bewertungen vorhanden</Text>
        )}
      </View>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <View style={styles.reviewsList}>
          {reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.clientName}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              <StarRating rating={review.rating} size={14} readonly />
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
          
          {reviews.length > 3 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                Alle {reviews.length} Bewertungen anzeigen
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bewertung abgeben</Text>
            <TouchableOpacity
              onPress={() => setShowReviewModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Wie bewerten Sie die Beratung?</Text>
              <StarRating
                rating={newRating}
                onRatingChange={setNewRating}
                size={32}
              />
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Ihre Erfahrung (optional)</Text>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Teilen Sie Ihre Erfahrung mit anderen..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {newComment.length}/500 Zeichen
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Abbrechen"
                onPress={() => setShowReviewModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={isSubmitting ? 'Wird gesendet...' : 'Bewertung abgeben'}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  addReviewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addReviewText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  ratingOverview: {
    alignItems: 'flex-start',
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  noReviewsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
  },
  commentSection: {
    marginBottom: 32,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundLight,
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});