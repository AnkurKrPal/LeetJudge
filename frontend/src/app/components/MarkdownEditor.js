import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '../lib/imageUrl';

export default function MarkdownEditor({ value, onChange, placeholder = "Write your markdown here...", storageKey }) {
  const [activeTab, setActiveTab] = useState('split'); // 'write', 'preview', 'split'
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, fileId, altText, markdownImage }]
  const [loaded, setLoaded] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`${storageKey}_images`);
      if (saved) {
        try {
          setUploadedImages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved images', e);
        }
      }
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (loaded && storageKey) {
      localStorage.setItem(`${storageKey}_images`, JSON.stringify(uploadedImages));
    }
  }, [uploadedImages, storageKey, loaded]);

  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newText = value.substring(0, startPos) + textToInsert + value.substring(endPos);
    
    onChange(newText);
    
    // Focus and move cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + textToInsert.length;
      textarea.selectionEnd = startPos + textToInsert.length;
    }, 0);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/problems/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url, fileId } = response.data;
      const altText = file.name || 'Image';
      const markdownImage = `![${altText}](${url})`;

      insertTextAtCursor(`\n${markdownImage}\n`);
      setUploadedImages(prev => [...prev, { url, fileId, altText, markdownImage }]);
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageToDelete) => {
    if (!confirm("Are you sure you want to delete this image? It will be permanently removed.")) return;
    
    const toastId = toast.loading('Deleting image...');
    try {
      await api.delete('/problems/delete-image', {
        data: { fileId: imageToDelete.fileId }
      });

      // Remove from state
      setUploadedImages(prev => prev.filter(img => img.url !== imageToDelete.url));
      
      // Auto-remove markdown from editor if present
      if (value.includes(imageToDelete.markdownImage)) {
        onChange(value.replace(`\n${imageToDelete.markdownImage}\n`, '\n').replace(imageToDelete.markdownImage, ''));
      }
      
      toast.success('Image deleted', { id: toastId });
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image', { id: toastId });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = null; // Reset input
    }
  };

  const TabButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      style={{
        padding: '0.5rem 1rem',
        border: 'none',
        background: activeTab === id ? 'var(--primary)' : 'transparent',
        color: activeTab === id ? 'white' : 'var(--text-secondary)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.875rem',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.5rem',
          backgroundColor: 'var(--bg-color)',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <TabButton id="write" label="Write" />
            <TabButton id="preview" label="Preview" />
            <TabButton id="split" label="Split View" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
             <input 
               type="file" 
               id="image-upload" 
               accept="image/*" 
               style={{ display: 'none' }} 
               onChange={handleFileChange}
               disabled={uploading}
             />
             <label 
               htmlFor="image-upload" 
               style={{
                 display: 'inline-flex',
                 alignItems: 'center',
                 padding: '0.5rem 1rem',
                 background: 'transparent',
                 border: '1px solid var(--border-color)',
                 borderRadius: 'var(--radius)',
                 color: 'var(--text-main)',
                 fontSize: '0.875rem',
                 cursor: uploading ? 'not-allowed' : 'pointer',
                 opacity: uploading ? 0.7 : 1,
                 transition: 'all 0.2s',
               }}
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
               </svg>
               {uploading ? 'Uploading...' : 'Upload Image'}
             </label>
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: '400px', display: 'flex' }}>
          {(activeTab === 'write' || activeTab === 'split') && (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{
                width: activeTab === 'split' ? '50%' : '100%',
                minHeight: '400px',
                padding: '1rem',
                border: 'none',
                borderRight: activeTab === 'split' ? '1px solid var(--border-color)' : 'none',
                resize: 'vertical',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-code)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            />
          )}
          
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div style={{ 
              width: activeTab === 'split' ? '50%' : '100%',
              padding: '1rem', 
              minHeight: '400px', 
              overflowY: 'auto' 
            }}>
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                  Preview will appear here
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div style={{
          padding: '1rem',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--surface)',
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Session Uploads</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {uploadedImages.map((img, idx) => {
                const finalSrc = resolveImageUrl(img.url);

                return (
              <div key={idx} style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                group: 'true'
              }}>
                <img src={finalSrc} alt={img.altText} referrerPolicy="no-referrer" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  title="Delete image permanently"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
