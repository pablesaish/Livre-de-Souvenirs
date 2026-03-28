import { useState, useRef } from 'react';
import { JournalAPI } from '../../api/journalService';

const DateModal = ({ dateKey, entry, userId, onClose, onUploadComplete, onEditClick }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState(Array.isArray(entry?.tags) ? entry.tags.join(', ') : (entry?.tags || ''));
  const [mood, setMood] = useState(entry?.mood || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const formatDate = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Convert a file to a base64 data URL.
   * This avoids Firebase Storage (which requires Blaze plan).
   * Images are stored directly in Firestore as base64 strings.
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Resize image to keep Firestore doc size reasonable (< 1MB)
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX_SIZE) {
            h = (h * MAX_SIZE) / w;
            w = MAX_SIZE;
          } else if (h > MAX_SIZE) {
            w = (w * MAX_SIZE) / h;
            h = MAX_SIZE;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const base64Url = await fileToBase64(file);
      await JournalAPI.saveEntry(userId, dateKey, {
        imageUrl: base64Url,
        thumbnailUrl: base64Url,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        mood,
        notes,
      });
      onUploadComplete();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!window.confirm('Delete this entry?')) return;
    try {
      await JournalAPI.deleteEntry(userId, dateKey);
      onUploadComplete();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const MOODS = ['😊', '😍', '🥲', '😌', '🤔', '😤', '🎉', '💪', '🌸', '✨'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
              {formatDate(dateKey)}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-light)' }}>
              {entry ? 'View & edit your entry' : 'Add a new memory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              background: 'rgba(228, 160, 160, 0.1)',
              color: 'var(--color-ink-light)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(228, 160, 160, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(228, 160, 160, 0.1)'; }}
          >
            ✕
          </button>
        </div>

        {/* Existing entry preview */}
        {entry?.imageUrl && !preview && (
          <div className="mb-5 relative group">
            <img
              src={entry.thumbnailUrl || entry.imageUrl}
              alt="Entry"
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: '280px', border: '2px solid var(--color-soft-pink)' }}
            />
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onEditClick(entry)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        )}

        {/* Upload area */}
        {!entry?.imageUrl && (
          <>
            {!preview ? (
              <div
                className={`dropzone mb-5 ${dragActive ? 'active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <div className="mb-3">
                  <span className="text-4xl block mb-2">📷</span>
                  <p className="font-medium" style={{ color: 'var(--color-ink)' }}>
                    Drop your photo here
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-ink-light)' }}>
                    or click to browse
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
              </div>
            ) : (
              <div className="mb-5 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-2xl object-cover"
                  style={{ maxHeight: '280px', border: '2px solid var(--color-soft-pink)' }}
                />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </>
        )}

        {/* Mood selector */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-ink)' }}>
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? '' : m)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 cursor-pointer"
                style={{
                  background: mood === m ? 'var(--color-blush)' : 'rgba(255,255,255,0.5)',
                  border: mood === m ? '2px solid var(--color-rose)' : '1px solid rgba(244,194,194,0.3)',
                  transform: mood === m ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-ink)' }}>
            Tags <span style={{ color: 'var(--color-ink-light)', fontWeight: 400 }}>(comma separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. travel, friends, sunset"
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 text-sm"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1.5px solid rgba(244,194,194,0.3)',
              color: 'var(--color-ink)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-rose)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(244,194,194,0.3)'; }}
          />
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-ink)' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write about your day..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 text-sm resize-none"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1.5px solid rgba(244,194,194,0.3)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-rose)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(244,194,194,0.3)'; }}
          />
        </div>

        {/* Saving indicator */}
        {uploading && (
          <div className="mb-4 text-center">
            <div className="w-8 h-8 border-3 border-rose rounded-full animate-spin mx-auto mb-2"
              style={{ borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--color-ink-light)' }}>Saving your memory...</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          {!entry?.imageUrl && file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {uploading ? 'Saving...' : '✨ Save Entry'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateModal;
