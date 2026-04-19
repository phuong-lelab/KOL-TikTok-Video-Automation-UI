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

  // Fix: Google Drive webViewLink không embed được trực tiếp.
  // Dùng direct download link để video player load được.
  const getPlayableUrl = (url: string, driveId?: string): string => {
    if (!url) return '';
    // Nếu là Drive view link → chuyển sang direct download
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    // Nếu đã là download link hoặc fal.ai URL → dùng trực tiếp
    return url;
  };

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

      {/* Video Player */}
      <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 relative">
        {isGenerating ? (
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-3 text-purple-400 animate-spin" />
            <p className="text-gray-400">Generating video with Kling AI...</p>
            <p className="text-xs text-gray-500 mt-2">This may take 1-3 minutes</p>
          </div>
        ) : currentGen ? (
          <>
            <video
              key={currentGen.id}
              className="w-full h-full object-contain bg-black"
              controls
              playsInline
              preload="auto"
            >
              <source
                src={getPlayableUrl(currentGen.url, currentGen.driveId)}
                type="video/mp4"
              />
              {/* Fallback: nếu URL trên không load được */}
              {currentGen.downloadLink && (
                <source
                  src={currentGen.downloadLink}
                  type="video/mp4"
                />
              )}
              Your browser does not support the video tag.
            </video>

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

      {/* Dot indicators */}
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

      {/* Action buttons */}
      <div className="flex gap-3">
        {/* Generate button */}
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
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Video
            </>
          )}
        </button>

      </div>

      {/* Drive link fallback */}
      {currentGen && (
        <div className="mt-2 flex justify-center gap-4">
          {currentGen.downloadLink && (
            <a
              href={currentGen.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              📥 Download
            </a>
          )}
          {currentGen.driveId && (
            <a
              href={`https://drive.google.com/file/d/${currentGen.driveId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              🔗 Open in Drive
            </a>
          )}
        </div>
      )}
    </div>
  );
};
