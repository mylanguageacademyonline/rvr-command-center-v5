'use client';
import { useState, useRef } from 'react';

export default function CameraCapture({ onCapture }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleCapture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for compression
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to < 500kb approx (quality 0.7 usually does the trick for 1000px)
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        
        setPreviewUrl(base64String);
        setCompressing(false);
        
        if (onCapture) {
          onCapture(base64String);
        }
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-capture-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      {!previewUrl ? (
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '1rem 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Take Photo of Receipt
        </button>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <img src={previewUrl} alt="Receipt Preview" style={{ width: '100%', borderRadius: '8px', border: '2px solid #334155' }} />
          <button 
            type="button" 
            onClick={() => setPreviewUrl(null)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {compressing && <p style={{ color: '#94a3b8' }}>Compressing image...</p>}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleCapture}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}
