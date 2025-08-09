
import React, { useState } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface RaceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedRace: string) => Promise<void>;
  currentRace: string;
}

const RACES = ['Nhân tộc', 'Thú tộc', 'Tinh linh', 'Ma tộc', 'Người dị giới', 'Người lùn', 'Long tộc'];

const RaceSelectionModal: React.FC<RaceSelectionModalProps> = ({ isOpen, onClose, onSave, currentRace }) => {
  const [selected, setSelected] = useState(currentRace);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(selected);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const footerContent = (
    <div className="flex justify-end w-full space-x-2">
       <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || selected === currentRace}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
        </button>
    </div>
  );
  
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật chủng loài" footerContent={footerContent}>
       {error && <p className="mb-3 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-2 rounded-md text-sm">{error}</p>}
      <p className="text-gray-700 dark:text-gray-300 mb-4">Chọn chủng loài mới của bạn. Điều này sẽ được hiển thị cho những người dùng khác.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {RACES.map(race => (
            <button
                key={race}
                onClick={() => setSelected(race)}
                className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none
                    ${selected === race 
                        ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30 ring-2 ring-secondary-500' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-secondary-400 hover:bg-secondary-50/50 dark:hover:bg-secondary-900/20'
                    }`
                }
            >
                <span className={`font-semibold ${selected === race ? 'text-secondary-700 dark:text-secondary-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {race}
                </span>
            </button>
        ))}
      </div>
    </Modal>
  );
};

export default RaceSelectionModal;
