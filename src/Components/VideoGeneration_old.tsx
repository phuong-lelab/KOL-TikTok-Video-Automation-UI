import React from 'react';
import { Video, Loader, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Trash2, CheckCircle } from 'lucide-react';

interface Generation {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  driveId?: string;
  fileName?: string;
  downloadLink?: string;
}

interface VideoGenerationBoxProps {
  title: string;
  type: 'intro' | 'outro';
  generations: Generation[];
  currentIndex: number;
  isGenerating: boolean;
  validatedImageId: string | null;
  onGenerate: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDelete: (index: number) => void;
  iconColor: string;
}

export const VideoGenerationBox: React.FC<VideoGenerationBoxProps> = ({
  title,
  generations,
  currentIndex,
  isGenerating,
  validatedImageId,
  onGenerate,
  onNavigate,
  onDelete,
  iconColor,
}) => {
  const currentGen = generations[currentIndex];
  const hasMultiple = generations.length > 1;

  return (
    <div className="glass-panel hover-beam rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`${iconColor} p-3 rounded-xl`}>
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">{title}</h3>
            {generations.length > 0 && (
              <p className="text-sm text-gray-400">
                Generation {currentIndex + 1} of {generations.length}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 relative">
        {isGenerating ? (
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-3 text-purple-400 animate-spin" />
            <p className="text-gray-400">Generating video with Veo 3...</p>
            <p className="text-xs text-gray-500 mt-2">This may take 1-3 minutes</p>
          </div>
        ) : currentGen ? (
          <>
            <video
              src={currentGen.url}
              className="w-full h-full object-cover"
              controls
              autoPlay
              loop
              muted
              onError={(e) => {
                console.error('Video load error:', currentGen.url);
              }}
            />

            {hasMultiple && (
              <>
                <button
                  onClick={() => onNavigate('prev')}
                  disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => onNavigate('next')}
                  disabled={currentIndex === generations.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <button
              onClick={() => onDelete(currentIndex)}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 p-2 rounded-full transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : !validatedImageId ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500">Complete image generation first</p>
          </div>
        ) : (
          <div className="text-center">
            <Video className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500">Ready to generate video</p>
            <p className="text-xs text-gray-600 mt-2">From validated image</p>
          </div>
        )}
      </div>

      {generations.length > 0 && (
        <div className="flex justify-center gap-2 mb-4">
          {generations.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-purple-400 w-6' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !validatedImageId}
          className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : currentGen ? (
            <>
              <RefreshCw className="w-5 h-5" />
              Generate New
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Video
            </>
          )}
        </button>
      </div>

      {currentGen && currentGen.downloadLink && (
        <a
          href={currentGen.downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-center text-xs text-gray-400 hover:text-white transition-colors"
        >
          📥 Download from Google Drive
        </a>
      )}
    </div>
  );
};
