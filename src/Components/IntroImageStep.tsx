import React, { useState } from 'react';
import { n8nApi } from './config';
import { IntroImageState, TempGeneratedImage } from './types';

export const IntroImageStep: React.FC = () => {
  const [state, setState] = useState<IntroImageState>({
    kolImageUrl: null,
    kolImageName: null,
    tempImages: [],
    selectedImageId: null,
    validatedImageId: null,
    isGenerating: false,
    isValidating: false,
    error: null,
  });

  // Handle KOL image URL input
  const handleKolImageChange = (url: string, name: string) => {
    setState(prev => ({
      ...prev,
      kolImageUrl: url,
      kolImageName: name,
    }));
  };

  // Generate intro image (save to TEMP)
  const handleGenerate = async () => {
    if (!state.kolImageUrl || !state.kolImageName) {
      setState(prev => ({ ...prev, error: 'Please provide KOL image' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const response = await n8nApi.generateIntroImage({
        kolImageUrl: state.kolImageUrl,
        kolImageName: state.kolImageName,
      });

      // Add to temp images list
      const newTempImage: TempGeneratedImage = {
        fileId: response.data.fileId,
        fileName: response.data.fileName,
        viewLink: response.data.viewLink,
        downloadLink: response.data.downloadLink,
        generatedAt: new Date().toISOString(),
        isSelected: false,
      };

      setState(prev => ({
        ...prev,
        tempImages: [...prev.tempImages, newTempImage],
        isGenerating: false,
      }));

      console.log('✅ Image generated:', response.data.fileName);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      }));
      console.error('❌ Generation error:', error);
    }
  };

  // Select an image for preview
  const handleSelectImage = (fileId: string) => {
    setState(prev => ({
      ...prev,
      selectedImageId: fileId,
      tempImages: prev.tempImages.map(img => ({
        ...img,
        isSelected: img.fileId === fileId,
      })),
    }));
  };

  // Accept selected image and validate (move TEMP → VALIDATED)
  const handleAccept = async () => {
    if (!state.selectedImageId) {
      setState(prev => ({ ...prev, error: 'Please select an image first' }));
      return;
    }

    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const response = await n8nApi.validateIntroImage(state.selectedImageId);

      setState(prev => ({
        ...prev,
        validatedImageId: response.data.validatedFileId,
        isValidating: false,
      }));

      console.log('✅ Image validated:', response.data.validatedFileName);
      
      // Continue to next step
      alert('Image validated! You can now continue to the next step.');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: error instanceof Error ? error.message : 'Failed to validate image',
      }));
      console.error('❌ Validation error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold gradient-text">Generate Intro Image</h2>

      {/* KOL Image Input */}
      <div className="glass-panel p-4 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">KOL Image URL</label>
          <input
            type="text"
            placeholder="https://example.com/kol-image.jpg"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
            onChange={(e) => handleKolImageChange(e.target.value, 'kol_image.jpg')}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={state.isGenerating || !state.kolImageUrl}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isGenerating ? '🔄 Generating...' : state.tempImages.length === 0 ? '✨ Generate' : '🔄 Regen'}
        </button>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          ❌ {state.error}
        </div>
      )}

      {/* Temp Images Gallery */}
      {state.tempImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Versions ({state.tempImages.length})</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {state.tempImages.map((img) => (
              <div
                key={img.fileId}
                onClick={() => handleSelectImage(img.fileId)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  img.isSelected 
                    ? 'border-purple-500 scale-105' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={img.viewLink}
                  alt={img.fileName}
                  className="w-full h-48 object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-xs">
                  <p className="truncate">{img.fileName}</p>
                  <p className="text-white/60">
                    {new Date(img.generatedAt).toLocaleTimeString()}
                  </p>
                </div>

                {img.isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {state.selectedImageId && !state.validatedImageId && (
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={state.isGenerating}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg"
          >
            🔄 Regen (Create Another)
          </button>
          
          <button
            onClick={handleAccept}
            disabled={state.isValidating}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
          >
            {state.isValidating ? '⏳ Validating...' : '✅ Accept & Continue'}
          </button>
        </div>
      )}

      {/* Success State */}
      {state.validatedImageId && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
          ✅ Image validated and saved! You can now proceed to the next step.
        </div>
      )}
    </div>
  );
};
