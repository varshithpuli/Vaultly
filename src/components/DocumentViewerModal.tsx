import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { DocumentAttachment } from '../data/attachmentSamples';

interface DocumentViewerModalProps {
  attachment: DocumentAttachment;
  onClose: () => void;
  onDelete?: (id: string) => void;
  itemName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  attachment,
  onClose,
  onDelete,
  itemName = 'Record',
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [maskPrivacy, setMaskPrivacy] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = attachment.dataUrl;
    a.download = attachment.name;
    a.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {attachment.name}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{itemName}</span>
                <span aria-hidden="true">·</span>
                <span>{attachment.fileSizeKb} KB</span>
                <span aria-hidden="true">·</span>
                <span>Uploaded {attachment.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskPrivacy((p) => !p)}
              title={maskPrivacy ? 'Disable Privacy Mask' : 'Mask Sensitive Digits'}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                maskPrivacy
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {maskPrivacy ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{maskPrivacy ? 'Privacy Mask ON' : 'Mask Digits'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Download Document"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
            </button>

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Remove attachment "${attachment.name}" from ${itemName}?`)) {
                    onDelete(attachment.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                title="Delete Attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Toolbar */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums px-1.5 min-w-[3.5rem] text-center font-medium">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(250, z + 25))}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(100);
                setRotation(0);
              }}
              className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium ml-2"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 90° ({rotation}°)</span>
            </button>
          </div>
        </div>

        {/* Document Canvas Body */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-200/50 dark:bg-slate-950/80 min-h-[400px]">
          <div
            className={`transition-all duration-200 shadow-xl rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 ${
              maskPrivacy ? 'relative' : ''
            }`}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className={`max-w-full max-h-[60vh] object-contain transition-all ${
                maskPrivacy ? 'filter blur-[3px]' : ''
              }`}
            />
            {maskPrivacy && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-amber-400/50 text-amber-300 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Privacy Mask Active · Digits Obfuscated</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        {attachment.notes && (
          <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
            {attachment.notes}
          </div>
        )}
      </div>
    </div>
  );
};
