import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => Promise<void>;
  storyTitle: string;
  currentRating: number;
}

const Star: React.FC<{
  filled: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="focus:outline-none transition-transform duration-150 transform hover:scale-125"
    aria-label={`Rate ${filled ? 'filled' : 'empty'} star`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
      <path
        className={filled ? 'text-amber-400' : 'text-primary-300 dark:text-primary-600'}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  </button>
);

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, storyTitle, currentRating }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setRating(currentRating);
        setError(null);
    }
  }, [isOpen, currentRating]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Vui lòng chọn một đánh giá.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(rating);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đánh giá.');
      setIsLoading(false);
    }
  };
  
  const footerContent = (
    <div className="flex justify-end w-full space-x-2">
      <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-primary-500 hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md">
        Hủy
      </button>
      <button onClick={handleSubmit} disabled={isLoading || !rating || rating === currentRating} className="px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-md hover:bg-secondary-700 disabled:opacity-50">
        {isLoading ? <LoadingSpinner size="sm" /> : 'Gửi đánh giá'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đánh giá "${storyTitle}"`} footerContent={footerContent}>
      <div className="flex flex-col items-center">
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <p className="text-primary-600 dark:text-primary-300 mb-4">Chọn số sao bạn muốn đánh giá cho truyện này.</p>
        <div className="flex items-center space-x-2" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              filled={(hoverRating || rating) >= star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => {}} // onMouseLeave on parent div handles this
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default RatingModal;
