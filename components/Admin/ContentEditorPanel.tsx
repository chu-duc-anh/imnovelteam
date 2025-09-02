import React, { useState, useRef, useCallback } from 'react';
import { StoryChapter, ContentBlock, ContentBlockText, ContentBlockImage } from '../../types';
import ContentEditableDiv from '../ContentEditableDiv';
import { generateId, fileToDataUrl } from '../../utils';
import { createText, createImage } from '../../constants';
import Modal from '../Modal';

interface ContentEditorPanelProps {
  chapter: StoryChapter | null;
  onUpdateBlocks: (newBlocks: ContentBlock[]) => void;
}

const ContentEditorPanel: React.FC<ContentEditorPanelProps> = ({ chapter, onUpdateBlocks }) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const activeEditableDivId = useRef<string | null>(null);
  
  const [annotationModal, setAnnotationModal] = useState<{
    isOpen: boolean;
    blockId: string | null;
    range: Range | null;
  }>({ isOpen: false, blockId: null, range: null });
  const [annotationInput, setAnnotationInput] = useState('');

  const handleBlockChange = (blockId: string, updates: Partial<ContentBlockText | ContentBlockImage>) => {
    if (!chapter) return;
    const currentBlocks = chapter.contentBlocks || [];
    const newBlocks = currentBlocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    onUpdateBlocks(newBlocks);
  };
  
  const handleFileUpload = async (blockId: string, file: File) => {
    try {
        const value = await fileToDataUrl(file);
        handleBlockChange(blockId, { value });
    } catch(err) {
        console.error("Image upload failed", err);
    }
  };

  const addBlock = (type: 'text' | 'image', index: number) => {
    if (!chapter) return;
    const currentBlocks = chapter.contentBlocks || [];
    const newBlock = type === 'text' ? createText('') : createImage('');
    const newBlocks = [...currentBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onUpdateBlocks(newBlocks);
  };

  const deleteBlock = (blockId: string) => {
    if (!chapter) return;
    const currentBlocks = chapter.contentBlocks || [];
    const newBlocks = currentBlocks.filter(b => b.id !== blockId);
    onUpdateBlocks(newBlocks);
  };
  
  const moveBlock = (index: number, direction: 'up' | 'down') => {
      if (!chapter) return;
      const currentBlocks = chapter.contentBlocks || [];
      const newBlocks = [...currentBlocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      onUpdateBlocks(newBlocks);
  };

  const handleApplyFormat = (blockId: string, format: 'bold' | 'italic' | 'underline') => {
    if (activeEditableDivId.current === blockId) {
        document.execCommand(format, false, undefined);
        const editor = document.getElementById(`editor-${blockId}`);
        if(editor) {
            handleBlockChange(blockId, { value: editor.innerHTML });
        }
    }
  };
  
  const handleApplyAnnotation = (blockId: string) => {
    if (activeEditableDivId.current !== blockId) {
        alert("Vui lòng chọn văn bản trong khối trình soạn thảo đang hoạt động để chú thích.");
        return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
        alert("Vui lòng chọn văn bản bạn muốn chú thích.");
        return;
    }

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    let isSelectionValid = false;
    while(container) {
        if (container.nodeType === 1 && (container as HTMLElement).id === `editor-${blockId}`) {
            isSelectionValid = true;
            break;
        }
        if (container === document.body) break;
        container = container.parentNode!;
    }

    if (!isSelectionValid) {
         alert("Lựa chọn văn bản của bạn dường như nằm ngoài khối trình soạn thảo hiện tại.");
         return;
    }
    
    setAnnotationModal({
        isOpen: true,
        blockId: blockId,
        range: range,
    });
    setAnnotationInput('');
  };

  const handleSaveAnnotation = () => {
    if (!annotationModal.isOpen || !annotationModal.range || !annotationModal.blockId) return;

    const { blockId, range } = annotationModal;
    const annotationText = annotationInput.trim();

    if (annotationText) {
      // Sanitize the tooltip text to be used in an attribute
      const sanitizedTooltipText = annotationText.replace(/"/g, '&quot;');

      // Create the main annotation span element
      const span = document.createElement('span');
      span.className = 'annotated-text';
      span.setAttribute('data-tooltip', sanitizedTooltipText);

      // Create the icon element
      const icon = document.createElement('i');
      icon.className = 'annotation-icon';

      try {
        // This is the key change: we manipulate the range object directly instead of using execCommand
        
        // Extract the selected content (text and nodes) from the document
        const selectedContent = range.extractContents();
        
        // Put the extracted content inside our new span
        span.appendChild(selectedContent);
        // Add the icon after the content, still inside the span
        span.appendChild(icon);

        // Insert the fully constructed span back into the document where the selection was
        range.insertNode(span);

        // Sync the DOM change back to React's state
        const editor = document.getElementById(`editor-${blockId}`);
        if (editor) {
          handleBlockChange(blockId, { value: editor.innerHTML });
        }
      } catch (e) {
        console.error("Failed to apply annotation:", e);
        // If something goes wrong, it's good to alert the user or log the error.
      }
    }

    // Close the modal and reset its state
    setAnnotationModal({ isOpen: false, blockId: null, range: null });
    setAnnotationInput('');
  };


  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8 text-primary-500 dark:text-primary-400">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h4M8 7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2l-1.57-3.664a1 1 0 01.33-1.332l1.332-.952a1 1 0 00.33-1.332L8 7z" /></svg>
          <h3 className="mt-2 text-lg font-medium text-primary-800 dark:text-primary-200">Chọn một chương</h3>
          <p className="mt-1 text-sm">Chọn một chương từ bảng cấu trúc để chỉnh sửa nội dung.</p>
        </div>
      </div>
    );
  }
  
  const contentBlocks = chapter.contentBlocks || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <h2 className="text-2xl font-bold font-serif text-primary-800 dark:text-primary-100 mb-1">Trình soạn thảo nội dung</h2>
      <p className="text-sm text-primary-500 dark:text-primary-400 mb-6">Đang sửa nội dung cho: <span className="font-semibold">{chapter.title}</span></p>

      <div className="space-y-4">
        {contentBlocks.map((block, index) => (
          <div key={block.id} className="bg-white dark:bg-primary-900 p-3 rounded-lg border border-primary-200 dark:border-primary-800/80 shadow-sm relative group">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 rounded-md bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V4.66L7.03 6.91a.75.75 0 01-1.06-1.06l3.5-3.5a.75.75 0 011.06 0l3.5 3.5a.75.75 0 01-1.06 1.06L10.75 4.66V17.25A.75.75 0 0110 18z" clipRule="evenodd" /></svg></button>
                <button onClick={() => moveBlock(index, 'down')} disabled={index === contentBlocks.length - 1} className="p-1.5 rounded-md bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v12.59l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V2.75A.75.75 0 0110 2z" clipRule="evenodd" /></svg></button>
                <button onClick={() => deleteBlock(block.id)} className="p-1.5 rounded-md bg-red-100 dark:bg-red-500/20 text-red-500 hover:bg-red-200 dark:hover:bg-red-500/30"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
            </div>
            {block.type === 'text' && (
              <div className="space-y-2">
                 <div className="flex items-center gap-1 border-b border-primary-200 dark:border-primary-800 pb-2">
                   <button onClick={() => handleApplyFormat(block.id, 'bold')} onMouseDown={e => e.preventDefault()} className="px-2 py-1 text-xs font-bold rounded-md hover:bg-primary-100 dark:hover:bg-primary-800">B</button>
                   <button onClick={() => handleApplyFormat(block.id, 'italic')} onMouseDown={e => e.preventDefault()} className="px-2 py-1 text-xs italic rounded-md hover:bg-primary-100 dark:hover:bg-primary-800">I</button>
                   <button onClick={() => handleApplyFormat(block.id, 'underline')} onMouseDown={e => e.preventDefault()} className="px-2 py-1 text-xs underline rounded-md hover:bg-primary-100 dark:hover:bg-primary-800">U</button>
                   <button onClick={() => handleApplyAnnotation(block.id)} onMouseDown={e => e.preventDefault()} className="px-2 py-1 text-xs rounded-md hover:bg-primary-100 dark:hover:bg-primary-800" title="Add Annotation">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                   </button>
                 </div>
                 <ContentEditableDiv
                    id={`editor-${block.id}`}
                    html={block.value}
                    onChange={value => handleBlockChange(block.id, { value })}
                    className="prose dark:prose-invert max-w-none !bg-transparent !border-0 !ring-0 !p-0"
                    placeholder="Bắt đầu viết..."
                    onFocus={() => activeEditableDivId.current = block.id}
                    onBlur={() => activeEditableDivId.current = null}
                 />
              </div>
            )}
            {block.type === 'image' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary-500">Khối ảnh</label>
                 {(block.value && (block.value.startsWith('http') || block.value.startsWith('data:'))) && <img src={block.value} alt={block.alt || ''} className="max-h-48 rounded-md border border-primary-200 dark:border-primary-800 object-contain"/>}
                <input type="text" placeholder="URL hình ảnh" value={(block.value && block.value.startsWith('http')) ? block.value : ''} onChange={e => handleBlockChange(block.id, { value: e.target.value })} className="w-full text-sm p-2 rounded-md bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 focus:ring-secondary-500 focus:border-secondary-500"/>
                <input type="file" accept="image/*" ref={el => { fileInputRefs.current[block.id] = el; }} onChange={e => { if (e.target.files?.[0]) handleFileUpload(block.id, e.target.files[0]) }} className="w-full text-sm text-primary-600 dark:text-primary-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary-500 file:text-white hover:file:bg-secondary-600"/>
                <input type="text" placeholder="Văn bản thay thế" value={block.alt || ''} onChange={e => handleBlockChange(block.id, { alt: e.target.value })} className="w-full text-sm p-2 rounded-md bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 focus:ring-secondary-500 focus:border-secondary-500"/>
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => addBlock('text', index)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                    Thêm văn bản
                </button>
                <button onClick={() => addBlock('image', index)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Thêm hình ảnh
                </button>
            </div>
          </div>
        ))}
         <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => addBlock('text', contentBlocks.length)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors border border-primary-300 dark:border-primary-700 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                Thêm văn bản
            </button>
            <button onClick={() => addBlock('image', contentBlocks.length)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors border border-primary-300 dark:border-primary-700 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Thêm hình ảnh
            </button>
        </div>
      </div>

       <Modal
        isOpen={annotationModal.isOpen}
        onClose={() => setAnnotationModal({ isOpen: false, blockId: null, range: null })}
        title="Thêm chú thích"
        footerContent={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setAnnotationModal({ isOpen: false, blockId: null, range: null })}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md"
            >
              Hủy
            </button>
            <button 
              onClick={handleSaveAnnotation} 
              className="px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-md hover:bg-secondary-700"
            >
              Lưu chú thích
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label htmlFor="annotation-input" className="block text-sm font-medium text-primary-700 dark:text-primary-300">
            Văn bản chú thích (Tooltip)
          </label>
          <input
            id="annotation-input"
            type="text"
            value={annotationInput}
            onChange={(e) => setAnnotationInput(e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 focus:ring-secondary-500 focus:border-secondary-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveAnnotation();
              }
            }}
          />
        </div>
      </Modal>

    </div>
  );
};

export default ContentEditorPanel;
