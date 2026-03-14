import React, { useState, useRef } from 'react';
import { Upload, Image, Video, Sparkles, ArrowRight, RefreshCw, CheckCircle, Loader, ChevronLeft, ChevronRight, Trash2, CloudUpload } from 'lucide-react';
import { UploadedFile, WorkflowStep } from './types';
import { n8nApi } from './config_old';
import { VideoGenerationBox } from './Components/VideoGeneration';

// Generation interface
interface Generation {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  driveId?: string;
  fileName?: string;
  downloadLink?: string;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.DATASET);
  const [kolImages, setKolImages] = useState<UploadedFile[]>([]);
  
  // Image Generation State with history
  const [introGenerations, setIntroGenerations] = useState<Generation[]>([]);
  const [outroGenerations, setOutroGenerations] = useState<Generation[]>([]);
  const [currentIntroIndex, setCurrentIntroIndex] = useState<number>(0);
  const [currentOutroIndex, setCurrentOutroIndex] = useState<number>(0);
  
  // Video Generation State with history
  const [introVideos, setIntroVideos] = useState<Generation[]>([]);
  const [outroVideos, setOutroVideos] = useState<Generation[]>([]);
  const [currentIntroVideoIndex, setCurrentIntroVideoIndex] = useState<number>(0);
  const [currentOutroVideoIndex, setCurrentOutroVideoIndex] = useState<number>(0);
  
  // Loading states
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false);
  const [isGeneratingOutro, setIsGeneratingOutro] = useState(false);
  const [isGeneratingIntroVideo, setIsGeneratingIntroVideo] = useState(false);
  const [isGeneratingOutroVideo, setIsGeneratingOutroVideo] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidatingVideos, setIsValidatingVideos] = useState(false);
  
  // Validation states
  const [validatedIntroId, setValidatedIntroId] = useState<string | null>(null);
  const [validatedOutroId, setValidatedOutroId] = useState<string | null>(null);
  const [validatedIntroVideoId, setValidatedIntroVideoId] = useState<string | null>(null);
  const [validatedOutroVideoId, setValidatedOutroVideoId] = useState<string | null>(null);

  const kolInputRef = useRef<HTMLInputElement>(null);

  // ==================== DATASET FUNCTIONS ====================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    console.log('📤 Starting upload for', files.length, 'file(s)...');

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      const tempFile: UploadedFile = {
        id: tempId,
        name: file.name,
        type: 'image' as const,
        url: URL.createObjectURL(file),
        file: file,
        isUploading: true,
      };

      setKolImages((prev) => [...prev, tempFile]);

      try {
        console.log('📤 Uploading to Google Drive:', file.name);
        
        const uploadResult = await n8nApi.uploadKolImage(file);
        
        console.log('✅ Upload successful:', uploadResult.data);

        setKolImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? {
                  ...img,
                  id: uploadResult.data.fileId,
                  driveUrl: uploadResult.data.publicUrl,
                  driveId: uploadResult.data.fileId,
                  isUploading: false,
                }
              : img
          )
        );
      } catch (error) {
        console.error('❌ Upload failed:', error);
        setKolImages((prev) => prev.filter((img) => img.id !== tempId));
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleInitializeWorkflow = async () => {
    if (kolImages.length === 0) return;
    
    const hasUploading = kolImages.some((img) => img.isUploading);
    if (hasUploading) {
      alert('Please wait for all images to finish uploading.');
      return;
    }

    setCurrentStep(WorkflowStep.IMAGE_GEN);
  };

  // ==================== IMAGE GENERATION FUNCTIONS ====================
  const generateIntroImage = async () => {
    if (kolImages.length === 0) {
      alert('Please upload KOL image first!');
      return;
    }

    const kolImage = kolImages[0];

    if (!kolImage.driveUrl || !kolImage.driveId) {
      alert('Image is still uploading. Please wait...');
      return;
    }

    setIsGeneratingIntro(true);

    try {
      console.log('🎨 Generating Intro Image...');
      
      const result = await n8nApi.generateIntroImage({
        kolImageUrl: kolImage.driveUrl,
        kolImageName: kolImage.name,
        kolImageDriveId: kolImage.driveId,
      });

      console.log('✅ Intro Image generated:', result);

      if (result.success && result.data) {
        const imageUrl = result.data.viewLink;
        
        const newGeneration: Generation = {
          id: result.data.fileId,
          url: imageUrl,
          prompt: 'Professional studio portrait',
          timestamp: Date.now(),
          driveId: result.data.fileId,
          fileName: result.data.fileName,
          downloadLink: result.data.downloadLink,
        };

        setIntroGenerations((prev) => [...prev, newGeneration]);
        setCurrentIntroIndex(introGenerations.length);
      }
    } catch (error) {
      console.error('❌ Error generating intro image:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Generation failed'}`);
    } finally {
      setIsGeneratingIntro(false);
    }
  };

  const generateOutroImage = async () => {
    if (kolImages.length === 0) {
      alert('Please upload KOL image first!');
      return;
    }

    const kolImage = kolImages[0];

    if (!kolImage.driveUrl || !kolImage.driveId) {
      alert('Image is still uploading. Please wait...');
      return;
    }

    setIsGeneratingOutro(true);

    try {
      console.log('🎨 Generating Outro Image...');
      
      const result = await n8nApi.generateOutroImage({
        kolImageUrl: kolImage.driveUrl,
        kolImageName: kolImage.name,
        kolImageDriveId: kolImage.driveId,
      });

      console.log('✅ Outro Image generated:', result);

      if (result.success && result.data) {
        const imageUrl = result.data.viewLink;
        
        const newGeneration: Generation = {
          id: result.data.fileId,
          url: imageUrl,
          prompt: 'Dynamic outdoor scene',
          timestamp: Date.now(),
          driveId: result.data.fileId,
          fileName: result.data.fileName,
          downloadLink: result.data.downloadLink,
        };

        setOutroGenerations((prev) => [...prev, newGeneration]);
        setCurrentOutroIndex(outroGenerations.length);
      }
    } catch (error) {
      console.error('❌ Error generating outro image:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Generation failed'}`);
    } finally {
      setIsGeneratingOutro(false);
    }
  };

  // Navigate between image generations
  const navigateIntroGen = (direction: 'prev' | 'next') => {
    setCurrentIntroIndex((prev) => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < introGenerations.length - 1) return prev + 1;
      return prev;
    });
  };

  const navigateOutroGen = (direction: 'prev' | 'next') => {
    setCurrentOutroIndex((prev) => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < outroGenerations.length - 1) return prev + 1;
      return prev;
    });
  };

  const deleteIntroGen = (index: number) => {
    setIntroGenerations((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (currentIntroIndex >= introGenerations.length - 1) {
      setCurrentIntroIndex(Math.max(0, introGenerations.length - 2));
    }
  };

  const deleteOutroGen = (index: number) => {
    setOutroGenerations((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (currentOutroIndex >= outroGenerations.length - 1) {
      setCurrentOutroIndex(Math.max(0, outroGenerations.length - 2));
    }
  };

  const handleContinueToVideoGen = async () => {
    if (introGenerations.length === 0 || outroGenerations.length === 0) {
      alert('Please generate at least one Intro and Outro image!');
      return;
    }

    setIsValidating(true);

    try {
      console.log('✅ Validating selected images (moving TEMP → VALIDATED)...');

      const selectedIntro = introGenerations[currentIntroIndex];
      const selectedOutro = outroGenerations[currentOutroIndex];

      if (selectedIntro.driveId) {
        console.log('📤 Validating Intro image:', selectedIntro.driveId);
        const introResult = await n8nApi.validateIntroImage(selectedIntro.driveId);
        console.log('✅ Intro validated:', introResult);
        
        if (introResult.success && introResult.data) {
          setValidatedIntroId(introResult.data.validatedFileId);
          alert(`✅ Intro image validated: ${introResult.data.validatedFileName}`);
        }
      }

      if (selectedOutro.driveId) {
        console.log('📤 Validating Outro image:', selectedOutro.driveId);
        const outroResult = await n8nApi.validateOutroImage(selectedOutro.driveId);
        console.log('✅ Outro validated:', outroResult);
        
        if (outroResult.success && outroResult.data) {
          setValidatedOutroId(outroResult.data.validatedFileId);
          alert(`✅ Outro image validated: ${outroResult.data.validatedFileName}`);
        }
      }

      console.log('🎉 Both images validated successfully!');
      alert('✅ Images validated! Proceeding to Video Generation...');
      
      setCurrentStep(WorkflowStep.VIDEO_GEN);
    } catch (error) {
      console.error('❌ Error validating images:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Validation failed'}`);
      
      const continueAnyway = confirm('Validation failed. Continue anyway?');
      if (continueAnyway) {
        setCurrentStep(WorkflowStep.VIDEO_GEN);
      }
    } finally {
      setIsValidating(false);
    }
  };

  // ==================== VIDEO GENERATION FUNCTIONS ====================
  const generateIntroVideo = async () => {
    if (!validatedIntroId) {
      alert('Please complete image generation first!');
      return;
    }

    setIsGeneratingIntroVideo(true);

    try {
      console.log('🎬 Generating Intro Video...');
      console.log('Using validated image ID:', validatedIntroId);
      
      const result = await n8nApi.generateIntroVideo({
        validatedImageId: validatedIntroId,
        prompt: 'A professional person riding a Vespa scooter through modern city streets with dynamic camera movement',
        duration: 5,
      });

      console.log('✅ Intro Video generated:', result);

      if (result.success && result.data) {
        const videoUrl = result.data.viewLink;
        
        const newGeneration: Generation = {
          id: result.data.fileId,
          url: videoUrl,
          prompt: 'Professional Vespa city scene',
          timestamp: Date.now(),
          driveId: result.data.fileId,
          fileName: result.data.fileName,
          downloadLink: result.data.downloadLink,
        };

        setIntroVideos((prev) => [...prev, newGeneration]);
        setCurrentIntroVideoIndex(introVideos.length);
      }
    } catch (error) {
      console.error('❌ Error generating intro video:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Video generation failed'}`);
    } finally {
      setIsGeneratingIntroVideo(false);
    }
  };

  const generateOutroVideo = async () => {
    if (!validatedOutroId) {
      alert('Please complete image generation first!');
      return;
    }

    setIsGeneratingOutroVideo(true);

    try {
      console.log('🎬 Generating Outro Video...');
      console.log('Using validated image ID:', validatedOutroId);
      
      const result = await n8nApi.generateOutroVideo({
        validatedImageId: validatedOutroId,
        prompt: 'A professional person riding a Vespa scooter through dynamic outdoor scene with cinematic movement',
        duration: 5,
      });

      console.log('✅ Outro Video generated:', result);

      if (result.success && result.data) {
        const videoUrl = result.data.viewLink;
        
        const newGeneration: Generation = {
          id: result.data.fileId,
          url: videoUrl,
          prompt: 'Dynamic outdoor Vespa scene',
          timestamp: Date.now(),
          driveId: result.data.fileId,
          fileName: result.data.fileName,
          downloadLink: result.data.downloadLink,
        };

        setOutroVideos((prev) => [...prev, newGeneration]);
        setCurrentOutroVideoIndex(outroVideos.length);
      }
    } catch (error) {
      console.error('❌ Error generating outro video:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Video generation failed'}`);
    } finally {
      setIsGeneratingOutroVideo(false);
    }
  };

  // Navigate between video generations
  const navigateIntroVideo = (direction: 'prev' | 'next') => {
    setCurrentIntroVideoIndex((prev) => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < introVideos.length - 1) return prev + 1;
      return prev;
    });
  };

  const navigateOutroVideo = (direction: 'prev' | 'next') => {
    setCurrentOutroVideoIndex((prev) => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < outroVideos.length - 1) return prev + 1;
      return prev;
    });
  };

  const deleteIntroVideo = (index: number) => {
    setIntroVideos((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (currentIntroVideoIndex >= introVideos.length - 1) {
      setCurrentIntroVideoIndex(Math.max(0, introVideos.length - 2));
    }
  };

  const deleteOutroVideo = (index: number) => {
    setOutroVideos((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (currentOutroVideoIndex >= outroVideos.length - 1) {
      setCurrentOutroVideoIndex(Math.max(0, outroVideos.length - 2));
    }
  };

  const handleContinueToAssembly = async () => {
    if (introVideos.length === 0 || outroVideos.length === 0) {
      alert('Please generate at least one Intro and Outro video!');
      return;
    }

    setIsValidatingVideos(true);

    try {
      console.log('✅ Validating selected videos (moving TEMP → VALIDATED)...');

      const selectedIntroVideo = introVideos[currentIntroVideoIndex];
      const selectedOutroVideo = outroVideos[currentOutroVideoIndex];

      if (selectedIntroVideo.driveId) {
        const result = await n8nApi.validateIntroVideo(selectedIntroVideo.driveId);
        console.log('✅ Intro video validated:', result);
        setValidatedIntroVideoId(result.data.validatedFileId);
        alert(`✅ Intro video validated: ${result.data.validatedFileName}`);
      }

      if (selectedOutroVideo.driveId) {
        const result = await n8nApi.validateOutroVideo(selectedOutroVideo.driveId);
        console.log('✅ Outro video validated:', result);
        setValidatedOutroVideoId(result.data.validatedFileId);
        alert(`✅ Outro video validated: ${result.data.validatedFileName}`);
      }

      alert('✅ Videos validated! Proceeding to Assembly...');
      setCurrentStep(WorkflowStep.ASSEMBLY);
    } catch (error) {
      console.error('❌ Error validating videos:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Validation failed'}`);
      
      const continueAnyway = confirm('Validation failed. Continue anyway?');
      if (continueAnyway) {
        setCurrentStep(WorkflowStep.ASSEMBLY);
      }
    } finally {
      setIsValidatingVideos(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">LE LAB - KOL TT MAX</h1>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {[
                { step: WorkflowStep.DATASET, label: 'Dataset' },
                { step: WorkflowStep.IMAGE_GEN, label: 'Images' },
                { step: WorkflowStep.VIDEO_GEN, label: 'Videos' },
                { step: WorkflowStep.ASSEMBLY, label: 'Assembly' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      currentStep === item.step
                        ? 'bg-purple-500 text-white'
                        : currentStep > item.step
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {currentStep > item.step ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`hidden md:block ${
                      currentStep === item.step ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* STEP 1: DATASET */}
        {currentStep === WorkflowStep.DATASET && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold gradient-text mb-4">Upload KOL Images</h2>
              <p className="text-gray-400">Images will be uploaded to Google Drive automatically</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel hover-beam rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">Upload Images</h3>
                    <p className="text-sm text-gray-400">JPG, PNG (Max 10MB)</p>
                  </div>
                </div>

                <input
                  ref={kolInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => kolInputRef.current?.click()}
                  className="w-full py-12 border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/60 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="w-12 h-12 text-purple-400" />
                  <span className="text-lg font-medium">Click to upload</span>
                  <span className="text-sm text-gray-500">Will upload to Google Drive</span>
                </button>
              </div>

              <div className="glass-panel rounded-2xl p-8">
                <h3 className="text-xl font-semibold mb-4">Uploaded Files ({kolImages.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {kolImages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
                  ) : (
                    kolImages.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        {file.isUploading ? (
                          <Loader className="w-5 h-5 text-purple-400 animate-spin" />
                        ) : file.driveUrl ? (
                          <CloudUpload className="w-5 h-5 text-green-400" />
                        ) : (
                          <Image className="w-5 h-5 text-purple-400" />
                        )}
                        <span className="flex-1 truncate">{file.name}</span>
                        {file.isUploading ? (
                          <span className="text-xs text-gray-400">Uploading...</span>
                        ) : file.driveUrl ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <span className="text-xs text-red-400">Failed</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleInitializeWorkflow}
                disabled={kolImages.length === 0 || kolImages.some((img) => img.isUploading)}
                className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
              >
                Continue to Image Generation
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: IMAGE GENERATION */}
        {currentStep === WorkflowStep.IMAGE_GEN && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold gradient-text mb-4">Generate Images with AI</h2>
              <p className="text-gray-400">Create intro and outro images using Gemini 2.5 Flash Image</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GenerationBox
                title="Intro Image"
                type="intro"
                generations={introGenerations}
                currentIndex={currentIntroIndex}
                isGenerating={isGeneratingIntro}
                onGenerate={generateIntroImage}
                onNavigate={navigateIntroGen}
                onDelete={deleteIntroGen}
                iconColor="bg-purple-500/20"
              />

              <GenerationBox
                title="Outro Image"
                type="outro"
                generations={outroGenerations}
                currentIndex={currentOutroIndex}
                isGenerating={isGeneratingOutro}
                onGenerate={generateOutroImage}
                onNavigate={navigateOutroGen}
                onDelete={deleteOutroGen}
                iconColor="bg-pink-500/20"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep(WorkflowStep.DATASET)}
                className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
              >
                Back
              </button>

              <button
                onClick={handleContinueToVideoGen}
                disabled={introGenerations.length === 0 || outroGenerations.length === 0 || isValidating}
                className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
              >
                {isValidating ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Continue to Video Generation
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VIDEO GENERATION */}
        {currentStep === WorkflowStep.VIDEO_GEN && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold gradient-text mb-4">Generate Videos with AI</h2>
              <p className="text-gray-400">Create intro and outro videos using Veo 3</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <VideoGenerationBox
                title="Intro Video"
                type="intro"
                generations={introVideos}
                currentIndex={currentIntroVideoIndex}
                isGenerating={isGeneratingIntroVideo}
                validatedImageId={validatedIntroId}
                onGenerate={generateIntroVideo}
                onNavigate={navigateIntroVideo}
                onDelete={deleteIntroVideo}
                iconColor="bg-purple-500/20"
              />

              <VideoGenerationBox
                title="Outro Video"
                type="outro"
                generations={outroVideos}
                currentIndex={currentOutroVideoIndex}
                isGenerating={isGeneratingOutroVideo}
                validatedImageId={validatedOutroId}
                onGenerate={generateOutroVideo}
                onNavigate={navigateOutroVideo}
                onDelete={deleteOutroVideo}
                iconColor="bg-pink-500/20"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep(WorkflowStep.IMAGE_GEN)}
                className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
              >
                Back
              </button>

              <button
                onClick={handleContinueToAssembly}
                disabled={introVideos.length === 0 || outroVideos.length === 0 || isValidatingVideos}
                className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
              >
                {isValidatingVideos ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Continue to Assembly
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ASSEMBLY */}
        {currentStep === WorkflowStep.ASSEMBLY && (
          <div className="animate-fade-in text-center">
            <h2 className="text-4xl font-bold gradient-text mb-4">Final Assembly</h2>
            <p className="text-gray-400 mb-8">Coming soon...</p>

            <button
              onClick={() => setCurrentStep(WorkflowStep.VIDEO_GEN)}
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
            >
              Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// ==================== GENERATION BOX COMPONENT ====================
interface GenerationBoxProps {
  title: string;
  type: 'intro' | 'outro';
  generations: Generation[];
  currentIndex: number;
  isGenerating: boolean;
  onGenerate: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDelete: (index: number) => void;
  iconColor: string;
}

const GenerationBox: React.FC<GenerationBoxProps> = ({
  title,
  generations,
  currentIndex,
  isGenerating,
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
            <Image className="w-8 h-8" />
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
            <p className="text-gray-400">Generating with Gemini AI...</p>
            <p className="text-xs text-gray-500 mt-2">This may take 10-30 seconds</p>
          </div>
        ) : currentGen ? (
          <>
            <img 
              src={currentGen.url} 
              alt={title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image load error:', currentGen.url);
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
        ) : (
          <div className="text-center">
            <Image className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500">Ready to generate</p>
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
          disabled={isGenerating}
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
              Generate
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

export default App;
