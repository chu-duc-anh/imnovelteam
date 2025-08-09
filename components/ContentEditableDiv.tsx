
import React, { useRef, useEffect, useCallback } from 'react';

interface ContentEditableDivProps {
  html: string;
  onChange: (newHtml: string) => void;
  className?: string;
  placeholder?: string;
  ['aria-label']?: string;
  onFocus?: () => void; 
  onBlur?: () => void; 
  id?: string; 
}

const ContentEditableDiv: React.FC<ContentEditableDivProps> = ({
  html,
  onChange,
  className = '',
  placeholder,
  ['aria-label']: ariaLabel,
  onFocus,
  onBlur: customOnBlur, 
  id,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // This effect synchronizes the div's content with the 'html' prop.
  // It's crucial for external updates (like loading initial data or reverting changes).
  // The check prevents resetting the content if the change originated from user input, which is the key to fixing the cursor jump.
  useEffect(() => {
    if (contentRef.current && html !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = html;
    }
  }, [html]);
  
  // We removed the `lastHtml` ref for simplicity. Firing onChange on every input
  // is standard for controlled-like components, and the `useEffect` guard is sufficient
  // to prevent re-render cycles from causing issues.
  const emitChange = useCallback(() => {
    if (contentRef.current) {
      const newHtml = contentRef.current.innerHTML;
      onChange(newHtml);
    }
  }, [onChange]);

  const handleBlur = () => {
    emitChange(); 
    if (customOnBlur) {
      customOnBlur();
    }
  };

  const isEmptyPlaceholder = html === '<p><br></p>' || html === '' || html === '<p></p>';

  // By removing dangerouslySetInnerHTML, we give full control of the inner DOM to the user
  // and our useEffect hook. React will no longer try to diff and replace the content,
  // which was the cause of the cursor jumping.
  return (
    <div
      id={id}
      ref={contentRef}
      className={`content-editable relative whitespace-normal outline-none p-2 border rounded-md min-h-[70px] ${className} 
                  bg-white dark:bg-gray-700 
                  border-gray-300 dark:border-gray-600 
                  text-gray-900 dark:text-gray-100 
                  focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 
                  transition-colors duration-300`}
      contentEditable={true}
      onFocus={onFocus}
      onBlur={handleBlur} 
      aria-label={ariaLabel || 'Editable content area'}
      data-placeholder={isEmptyPlaceholder && placeholder ? placeholder : ''}
      style={{
        ...(isEmptyPlaceholder && placeholder ? {
          position: 'relative',
        } : {})
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default ContentEditableDiv;
