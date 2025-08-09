
import React, { useState, useRef } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => Promise<void>;
  imageSrc: string;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );
    
    return canvas.toDataURL('image/jpeg', 0.9);
}

const AvatarCropModal: React.FC<AvatarCropModalProps> = ({ isOpen, onClose, onSave, imageSrc }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // To fix the type error, we create the initial crop in pixels ('px')
        // instead of percent ('%'), ensuring that the 'crop' object is a PixelCrop.
        const crop = centerCrop(
            makeAspectCrop({
                unit: 'px',
                width: Math.min(width, height) * 0.9
            }, 1, width, height),
            width,
            height
        );
        setCrop(crop);
        setCompletedCrop(crop);
    };

    const handleSaveCrop = async () => {
        if (!completedCrop || !imgRef.current) {
            return;
        }
        setIsLoading(true);
        try {
            const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop);
            await onSave(croppedImageUrl);
        } catch (error) {
            console.error('Error saving cropped image:', error);
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
          onClick={handleSaveCrop}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
        </button>
      </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crop Your Avatar" footerContent={footerContent} size="lg">
             <div className="flex flex-col items-center">
                {imageSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageSrc}
                            style={{ transform: `scale(${scale})` }}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                )}
                <div className="mt-4 w-full max-w-xs">
                    <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zoom</label>
                    <input
                        id="zoom"
                        type="range"
                        value={scale}
                        min="1"
                        max="2"
                        step="0.01"
                        aria-labelledby="Zoom"
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
             </div>
        </Modal>
    );
};

export default AvatarCropModal;
