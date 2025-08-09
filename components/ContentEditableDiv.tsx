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

  // Effect to sync the DOM with the `html` prop from state.
  // This is the "controlled" part of the component and the single source of truth
  // for setting the content from outside the component.
  useEffect(() => {
    if (contentRef.current && html !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = html;
    }
  }, [html]);
  
  // onInput is the standard event for contentEditable changes (typing, pasting, etc.)
  const handleInput = useCallback(() => {
    if (contentRef.current) {
      const newHtml = contentRef.current.innerHTML;
      if (html !== newHtml) { // Only call onChange if content is actually different
        onChange(newHtml);
      }
    }
  }, [onChange, html]);

  // onBlur is a good fallback for final cleanup/sync, e.g., after pasting.
  const handleBlur = () => {
    if (contentRef.current) {
        const newHtml = contentRef.current.innerHTML;
        // A final check to ensure state is synchronized.
        if (html !== newHtml) {
            onChange(newHtml);
        }
    }
    if (customOnBlur) {
      customOnBlur();
    }
  };

  const isEmptyPlaceholder = html === '<p><br></p>' || html === '' || html === '<p></p>';

  // We DO NOT use dangerouslySetInnerHTML. The content is now managed imperatively
  // by the useEffect hook, which is the correct pattern for integrating with non-React
  // DOM mutation patterns like contentEditable.
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
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={handleBlur} 
      aria-label={ariaLabel || 'Editable content area'}
      data-placeholder={isEmptyPlaceholder && placeholder ? placeholder : ''}
      style={{
        ...(isEmptyPlaceholder && placeholder ? {
          position: 'relative',
        } : {})
      }}
    />
  );
};

export default ContentEditableDiv;
