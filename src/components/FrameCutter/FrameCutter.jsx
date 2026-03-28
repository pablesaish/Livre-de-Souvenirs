import { useState, useRef, useEffect, useCallback } from 'react';
import { JournalAPI } from '../../api/journalService';

class FrameStack {
  constructor() { this.items = []; }
  push(item) { this.items.push(JSON.parse(JSON.stringify(item))); }
  pop() { return this.items.length ? this.items.pop() : null; }
  peek() { return this.items.length ? this.items[this.items.length - 1] : null; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

// Function to play a synthetic camera shutter sound using Web Audio API
const playCameraSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First click (mirror slap)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    // Second click (shutter curtain)
    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.4, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.1);
    }, 80);
  } catch (e) {
    console.log("Audio not supported or blocked", e);
  }
};

const FrameCutterTool = ({ entry, userId, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  
  // Track camera orientation: portrait (false) or landscape (true)
  const [isLandscape, setIsLandscape] = useState(false);

  // Dynamic Crop Dimensions
  const HOLE_W = isLandscape ? 200 : 150;
  const HOLE_H = isLandscape ? 150 : 200;

  // Frame position relative to the image container
  const [frame, setFrame] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const undoStack = useRef(new FrameStack());
  const redoStack = useRef(new FrameStack());

  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [tempThumbnail, setTempThumbnail] = useState(null);

  // Center frame whenever orientation changes or image loads
  const centerFrame = useCallback(() => {
     const container = containerRef.current;
     if (container) {
       const initialFrame = {
         x: (container.clientWidth - HOLE_W) / 2,
         y: (container.clientHeight - HOLE_H) / 2
       };
       setFrame(initialFrame);
       undoStack.current.push(initialFrame);
     }
  }, [HOLE_W, HOLE_H]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setTimeout(centerFrame, 50);
    };
    img.src = entry.imageUrl;
  }, [entry.imageUrl, centerFrame]);

  // Also center when rotation changes
  useEffect(() => {
    if (imageLoaded) {
      setTimeout(centerFrame, 10);
    }
  }, [isLandscape, imageLoaded, centerFrame]);

  const saveToUndoStack = useCallback(() => {
    undoStack.current.push(frame);
    redoStack.current = new FrameStack();
  }, [frame]);

  const handleUndo = () => {
    if (undoStack.current.size() <= 1) return;
    const current = undoStack.current.pop();
    redoStack.current.push(current);
    const prev = undoStack.current.peek();
    if (prev) setFrame(prev);
  };

  const handleRedo = () => {
    if (redoStack.current.isEmpty()) return;
    const next = redoStack.current.pop();
    undoStack.current.push(next);
    setFrame(next);
  };

  // --- Handlers: Dragging the Camera Frame --- //
  const handleDragStart = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    
    setDragStart({ 
      x: clientX - rect.left - frame.x, 
      y: clientY - rect.top - frame.y 
    });
    setIsDragging(true);
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    setFrame({
      // Free floating camera - accessible to entire screen
      x: mx - dragStart.x,
      y: my - dragStart.y,
    });
  }, [isDragging, dragStart, HOLE_W, HOLE_H]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      saveToUndoStack();
    }
  }, [isDragging, saveToUndoStack]);

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // --- Cut / Crop --- //
  const handleCut = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setSaving(true);
    playCameraSound(); // Snap snap!
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      const container = containerRef.current;

      const scaleX = img.naturalWidth / container.clientWidth;
      const scaleY = img.naturalHeight / container.clientHeight;

      const sx = frame.x * scaleX;
      const sy = frame.y * scaleY;
      const sw = HOLE_W * scaleX;
      const sh = HOLE_H * scaleY;

      canvas.width = HOLE_W;
      canvas.height = HOLE_H;
      
      // Use black background for out of bounds areas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, HOLE_W, HOLE_H);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, HOLE_W, HOLE_H);

      const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.85);

      // Simple visual feedback
      setIsSnapping(true);
      
      setTimeout(() => {
         setIsSnapping(false);
         setTempThumbnail(thumbnailBase64);
         setShowCaptionInput(true);
         setSaving(false);
      }, 300);
    } catch (err) {
      console.error('Crop failed:', err);
      alert('Crop failed: ' + err.message);
      setSaving(false);
    }
  };

  const handleFinalSave = async () => {
    setSaving(true);
    try {
      await JournalAPI.saveEntry(userId, entry.dateKey, {
        ...entry,
        thumbnailUrl: tempThumbnail,
        isLandscape,
        caption: captionText || entry.dateKey.replace(/-/g, '.')
      });
      onSave();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed: ' + err.message);
      setSaving(false);
    }
  };

  if (showCaptionInput) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 animate-fade-in" style={{ backgroundColor: 'rgba(245, 240, 235, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="bg-white p-8 pb-12 shadow-2xl max-w-sm w-full animate-fade-in-up text-center rounded-2xl border border-[var(--color-border)]">
          <div className="w-full aspect-[4/5] mb-8 overflow-hidden rounded-lg shadow-inner bg-[var(--color-cream-dark)]">
             <img src={tempThumbnail} alt="Cropped" className="w-full h-full object-cover" />
          </div>
          
          <h3 className="text-2xl mb-2 font-normal italic" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
            Caption your memory
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-8">A moment worth gold</p>
          
          <input 
            type="text" 
            autoFocus
            maxLength={30}
            placeholder={entry.dateKey.replace(/-/g, '.')}
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            className="w-full text-center border-b border-[var(--color-border)] pb-3 mb-10 focus:outline-none focus:border-[var(--color-gold)] bg-transparent tracking-widest text-sm transition-colors"
            style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
          />

          <button
             onClick={handleFinalSave}
             disabled={saving}
             className="btn-aesthetic btn-aesthetic-gold w-full py-4 text-[11px] font-bold"
          >
             <span>{saving ? 'SAVING...' : 'ADD TO JOURNAL'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ backgroundColor: 'var(--color-cream-dark)' }}>
      {/* Top Bar */}
      <div className="flex justify-between p-6 z-50 pointer-events-none">
        <button onClick={onClose} className="btn-aesthetic pointer-events-auto shadow-md">
          <span>← Cancel</span>
        </button>
        <div className="flex gap-2 pointer-events-auto">
          {/* Rotate Button */}
          <button 
             onClick={() => setIsLandscape(!isLandscape)} 
             className="btn-aesthetic !w-12 !h-12 !p-0 shadow-md pointer-events-auto"
             title="Rotate Camera"
          >
             <span>
               <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
               </svg>
             </span>
          </button>
          {/* Undo / Redo */}
          <button onClick={handleUndo} disabled={undoStack.current.size() <= 1} className="btn-aesthetic !w-12 !h-12 !p-0 shadow-md pointer-events-auto disabled:opacity-30">
            <span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
            </span>
          </button>
          <button onClick={handleRedo} disabled={redoStack.current.isEmpty()} className="btn-aesthetic !w-12 !h-12 !p-0 shadow-md pointer-events-auto disabled:opacity-30">
             <span>
               <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" /></svg>
             </span>
          </button>
        </div>
      </div>

      <div className="absolute top-20 left-0 w-full text-center z-40 pointer-events-none">
        <p className="text-xs font-medium opacity-50 uppercase tracking-widest mt-4" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>Drag camera to crop</p>
      </div>

      {/* Editor area - Fixed image, Dragging frame */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
         {imageLoaded ? (
            <div 
              ref={containerRef} 
              className="relative shadow-2xl select-none"
              style={{ maxWidth: '100%', maxHeight: '75vh' }}
            >
               {/* Background Image (Fixed) */}
               <img 
                 src={entry.imageUrl} 
                 alt="Source" 
                 className="max-w-full max-h-[75vh] object-contain block pointer-events-none" 
                 draggable={false} 
               />
               
               {/* Draggable Crop Window (The Camera) */}
               <div 
                 className="absolute cursor-grab active:cursor-grabbing overflow-visible z-20"
                 style={{
                   left: frame.x,
                   top: frame.y,
                   width: HOLE_W,
                   height: HOLE_H,
                   background: 'transparent'
                 }}
                 onMouseDown={handleDragStart}
                 onTouchStart={handleDragStart}
               >
                 {/* The Camera Overlay Image Wrapper - Now draggable from anywhere on the camera body */}
                 <div className="absolute transition-all duration-300 z-10"
                      style={{
                        width: '150px',
                        height: '200px',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) ${isLandscape ? 'rotate(-90deg)' : ''} ${isSnapping ? 'scale(0.95)' : 'scale(1)'}`,
                        transformOrigin: '50% 50%',
                        pointerEvents: 'auto',
                        filter: isSnapping ? 'brightness(1.4)' : 'none'
                      }}>
                     <img 
                        id="camera-overlay"
                        src="/camera.png" 
                        alt="Camera Overlay"
                        className="absolute cursor-grab active:cursor-grabbing transition-opacity duration-300"
                        draggable={false}
                        style={{
                           width: '251%',
                           left: '-60.5%',
                           top: '-42%',
                           maxWidth: 'none',
                           filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.5))',
                           pointerEvents: 'auto'
                        }}
                     />
                     <button
                        onClick={(e) => { e.stopPropagation(); handleCut(); }}
                        disabled={saving}
                        className="absolute w-12 h-12 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform z-30 pointer-events-auto"
                        style={{
                           top: '-10%', 
                           right: '-40%', 
                           background: 'rgba(255,255,255,0.01)'
                        }}
                     />
                 </div>
               </div>
            </div>
         ) : (
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-[var(--color-ink-light)] rounded-full animate-spin mx-auto mb-3"
                style={{ borderTopColor: 'transparent' }} />
            </div>
         )}
      </div>

      {/* Manual generic cut button at bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
          <button
             onClick={handleCut}
             disabled={saving || !imageLoaded}
             className="btn-aesthetic btn-aesthetic-gold px-12 py-5 shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm font-bold"
          >
             <span>
               {saving ? 'PROCESSING...' : 'SNAP MEMORY'}
               <svg className="inline-block ml-3" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
             </span>
          </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FrameCutterTool;
