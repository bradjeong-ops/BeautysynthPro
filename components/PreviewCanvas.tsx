
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewProps {
  image: string | null;
  loading: boolean;
  onDownload?: () => void;
  onClick?: () => void;
}

export const PreviewCanvas: React.FC<PreviewProps> = ({ image, loading, onClick }) => {
  return (
    <div className="w-full h-full relative group">
      {loading && (
        <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">Synthesizing Aesthetics...</h3>
            <p className="text-zinc-500 text-sm max-w-[240px] mx-auto animate-pulse">
              Gemini AI is calculating facial symmetry and high-resolution skin textures.
            </p>
          </div>
        </div>
      )}

      {image ? (
        <img 
          src={image} 
          className={`w-full h-full object-contain ${onClick ? 'cursor-zoom-in' : ''}`} 
          alt="Generated Beauty" 
          onClick={onClick}
        />
      ) : !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="text-3xl font-bold text-zinc-700">?</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-zinc-300 font-medium">No results yet</h3>
            <p className="text-zinc-500 text-sm">Upload a base image and start the synthesis to see the results.</p>
          </div>
        </div>
      )}
    </div>
  );
};
