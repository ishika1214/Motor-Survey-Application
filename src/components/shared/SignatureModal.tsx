'use client';
import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Upload, PenTool, ShieldCheck, Palette } from 'lucide-react';
import { KP } from '@/lib/constants';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sigData: string | null) => void; // null means reset to default digital stamp
  currentSig: string | null;
}

export function SignatureModal({
  isOpen,
  onClose,
  onSave,
  currentSig,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stamp' | 'draw' | 'upload'>('stamp');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [penColor, setPenColor] = useState('#0D2137');
  const [penWidth, setPenWidth] = useState(2.5);

  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  // Setup High-DPI canvas whenever modal opens or tab changes to 'draw'
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen, activeTab, penColor, penWidth]);

  if (!isOpen) return null;

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    pointsRef.current = [pos];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    const points = pointsRef.current;
    points.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length < 3) {
      const p1 = points[0];
      const p2 = points[1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      // Midpoints for smooth quadratic Bezier curve interpolation
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    pointsRef.current = [];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (activeTab === 'stamp') {
      onSave(null); // default stamp
    } else if (activeTab === 'draw' && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    } else if (activeTab === 'upload' && uploadedImage) {
      onSave(uploadedImage);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 33, 55, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #0D2137 0%, #1A3A6B 100%)',
            padding: '14px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #C8860A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
            <ShieldCheck size={20} style={{ color: '#C8860A' }} />
            <span>Digital Signature Settings</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '16px',
              borderBottom: '1px solid #C5D0DC',
              paddingBottom: '8px',
            }}
          >
            <button
              onClick={() => setActiveTab('stamp')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'stamp' ? '#0D2137' : '#F0F4F9',
                color: activeTab === 'stamp' ? '#fff' : '#607080',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} /> Official Digital Stamp
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'draw' ? '#0D2137' : '#F0F4F9',
                color: activeTab === 'draw' ? '#fff' : '#607080',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <PenTool size={14} /> Smooth Cursor Draw
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'upload' ? '#0D2137' : '#F0F4F9',
                color: activeTab === 'upload' ? '#fff' : '#607080',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Upload size={14} /> Upload Image
            </button>
          </div>

          {/* Tab 1: Official Stamp */}
          {activeTab === 'stamp' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  border: '2px dashed #C8860A',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#FFF8E6',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: "'Playfair Display', cursive, serif", fontSize: '24px', fontWeight: 800, color: '#0D2137', fontStyle: 'italic' }}>
                  Kumar Pankaj
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1A3A6B', marginTop: '4px', letterSpacing: '0.5px' }}>
                  DIGITALLY SIGNED &amp; VERIFIED
                </div>
                <div style={{ fontSize: '9px', color: '#607080', marginTop: '2px' }}>
                  IRDA Lic: {KP.lic} | Expiry: {KP.validity}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#607080', marginTop: '12px', textAlign: 'center' }}>
                This is the standard official IRDAI digital signature stamp badge.
              </div>
            </div>
          )}

          {/* Tab 2: Canvas Draw */}
          {activeTab === 'draw' && (
            <div>
              {/* Color & Stroke Weight Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  padding: '6px 12px',
                  background: '#F0F4F9',
                  borderRadius: '6px',
                  border: '1px solid #C5D0DC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#607080', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Palette size={13} /> Ink Color:
                  </span>
                  {[
                    { name: 'Navy Blue', col: '#0D2137' },
                    { name: 'Royal Blue', col: '#1A3A6B' },
                    { name: 'Black', col: '#111827' },
                  ].map((c) => (
                    <button
                      key={c.col}
                      onClick={() => setPenColor(c.col)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c.col,
                        border: penColor === c.col ? '2px solid #C8860A' : '1px solid #ccc',
                        cursor: 'pointer',
                        transform: penColor === c.col ? 'scale(1.2)' : 'none',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#607080' }}>Pen Width:</span>
                  {[
                    { lbl: 'Fine', w: 1.8 },
                    { lbl: 'Medium', w: 2.5 },
                    { lbl: 'Thick', w: 3.5 },
                  ].map((st) => (
                    <button
                      key={st.lbl}
                      onClick={() => setPenWidth(st.w)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #C5D0DC',
                        background: penWidth === st.w ? '#0D2137' : '#fff',
                        color: penWidth === st.w ? '#fff' : '#607080',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {st.lbl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearCanvas}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#B71C1C',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={12} /> Clear
                </button>
              </div>

              {/* High-DPI Smooth Drawing Pad */}
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  border: '1.5px solid #1A3A6B',
                  borderRadius: '8px',
                  width: '100%',
                  height: '160px',
                  background: '#FFFFFF',
                  cursor: 'crosshair',
                  touchAction: 'none',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                }}
              />
              <div style={{ fontSize: '10px', color: '#607080', marginTop: '4px', fontStyle: 'italic', textAlign: 'center' }}>
                ✍️ Bezier curve smoothing enabled for fluid, natural cursor pen strokes.
              </div>
            </div>
          )}

          {/* Tab 3: Upload Image */}
          {activeTab === 'upload' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                onChange={handleFileUpload}
                id="sig-file-input"
                style={{ display: 'none' }}
              />
              <label
                htmlFor="sig-file-input"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#1A3A6B',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Upload size={16} /> Choose Signature File
              </label>
              {uploadedImage && (
                <div style={{ marginTop: '16px' }}>
                  <img
                    src={uploadedImage}
                    alt="Signature preview"
                    style={{ maxHeight: '100px', maxWidth: '100%', border: '1px solid #C5D0DC', borderRadius: '6px', padding: '4px' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            background: '#F0F4F9',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid #C5D0DC',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #C5D0DC',
              background: '#fff',
              color: '#607080',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#1B5E20',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={14} /> Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
}
