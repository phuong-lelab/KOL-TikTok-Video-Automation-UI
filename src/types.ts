export interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'intro-bg' | 'outro-bg';
  url: string;
  file: File;
  driveUrl?: string;  // Google Drive public URL
  driveId?: string;   // Google Drive file ID
  isUploading?: boolean;
}

export interface VideoAsset {
  id: string;
  type: 'intro' | 'middle' | 'outro';
  url: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  driveId?: string;
}

export interface FinalVideo {
  id: string;
  url: string;
  status: 'idle' | 'assembling' | 'completed' | 'error';
  driveId?: string;
  localPath?: string;
}

export enum WorkflowStep {
  DATASET = 0,
  IMAGE_GEN = 1,
  VIDEO_GEN = 2,
  ASSEMBLY = 3
}

export interface N8nWebhookResponse {
  success: boolean;
  data?: any;
  message?: string;
  driveId?: string;
  url?: string;
  tempDriveId?: string;
  videos?: VideoAsset[];
}

// ===== TYPES FOR IMAGE GENERATION =====

export interface TempGeneratedImage {
  fileId: string;
  fileName: string;
  viewLink: string;
  downloadLink: string;
  generatedAt: string;
  isSelected: boolean;
}

export interface IntroImageState {
  kolImageUrl: string | null;
  kolImageName: string | null;
  tempImages: TempGeneratedImage[];
  selectedImageId: string | null;
  validatedImageId: string | null;
  isGenerating: boolean;
  isValidating: boolean;
  error: string | null;
}

export interface OutroImageState {
  kolImageUrl: string | null;
  kolImageName: string | null;
  tempImages: TempGeneratedImage[];
  selectedImageId: string | null;
  validatedImageId: string | null;
  isGenerating: boolean;
  isValidating: boolean;
  error: string | null;
}

export interface AppState {
  currentStep: WorkflowStep;
  introImage: IntroImageState;
  outroImage: OutroImageState;
  middleVideos: UploadedFile[];
  finalVideo: FinalVideo | null;
}
