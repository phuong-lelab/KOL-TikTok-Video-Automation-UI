export const API_CONFIG = {
  N8N_BASE_URL: 'https://lelabui.app.n8n.cloud',
  
  WEBHOOKS: {
    // Upload endpoint
    UPLOAD_KOL_IMAGE: '/webhook/upload-kol-image',
    
    // Generate endpoints (save to TEMP folder)
    GENERATE_INTRO_IMAGE: '/webhook/generate-intro-image',
    GENERATE_OUTRO_IMAGE: '/webhook/generate-outro-image',
    GENERATE_INTRO_VIDEO: '/webhook/generate-intro-video',
    GENERATE_OUTRO_VIDEO: '/webhook/generate-outro-video',
    
    // Validate endpoints (move TEMP → VALIDATED folder)
    VALIDATE_INTRO_IMAGE: '/webhook/validate-intro-image',
    VALIDATE_OUTRO_IMAGE: '/webhook/validate-outro-image',
    VALIDATE_INTRO_VIDEO: '/webhook/validate-intro-video',
    VALIDATE_OUTRO_VIDEO: '/webhook/validate-outro-video',

    // Assembly endpoint
    ASSEMBLE_VIDEO: '/webhook/video-assembly',
  },

  // Google Drive folder IDs for Assembly
  DRIVE_FOLDERS: {
    // Folder chứa intro/outro example videos (test mode)
    EXAMPLE_VIDEOS: '1KG_l_ehHy60o_Zw11btASvjtec3AJVGV',
    // Folder chứa 4 product videos (middle)
    PRODUCT_VIDEOS: '1xva2YeUlONA6iG8Y1MBT4tIQhR_FPPv-',
  },
};

// API Response Types
export interface UploadImageResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    publicUrl: string;
    viewLink: string;
    downloadUrl: string;
  };
}

export interface GenerateImageResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    fileId: string;
    viewLink: string;
    downloadLink: string;
  };
  metadata?: {
    generatedAt: string;
    model: string;
    provider: string;
  };
}

export interface ValidateImageResponse {
  success: boolean;
  message: string;
  data: {
    validatedFileId: string;
    validatedFileName: string;
    viewLink: string;
  };
}

export interface AssembleVideoResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    fileName: string;
    viewLink: string;
    downloadLink: string;
  };
}

// Helper function to call n8n webhooks
export const apiCall = async (endpoint: string, data: any): Promise<any> => {
  try {
    const url = `${API_CONFIG.N8N_BASE_URL}${endpoint}`;
    console.log(`🚀 Calling: ${url}`);
    console.log('📤 Request data:', data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`API Error (${response.status}): ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Success:', result);
    
    return result;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // Include data URL prefix
    };
    reader.onerror = (error) => reject(error);
  });
};

// Specific API calls
export const n8nApi = {
  // Upload KOL image to Google Drive
  uploadKolImage: async (file: File): Promise<UploadImageResponse> => {
    console.log('📤 Converting file to Base64...');
    const base64Data = await fileToBase64(file);
    
    console.log('📤 Uploading to Google Drive via n8n...');
    return apiCall(API_CONFIG.WEBHOOKS.UPLOAD_KOL_IMAGE, {
      base64Data,
      fileName: file.name,
    });
  },

  // Generate Intro Image (save to TEMP)
  generateIntroImage: async (params: {
    kolImageUrl: string;
    kolImageName: string;
    kolImageDriveId?: string;
    prompt?: string;
  }): Promise<GenerateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.GENERATE_INTRO_IMAGE, {
      kolImageUrl: params.kolImageUrl,
      kolImageName: params.kolImageName,
      kolImageDriveId: params.kolImageDriveId,
      prompt: params.prompt || 'Professional studio portrait with soft lighting and modern background',
      backgroundType: 'intro',
    });
  },

  // Generate Outro Image (save to TEMP)
  generateOutroImage: async (params: {
    kolImageUrl: string;
    kolImageName: string;
    kolImageDriveId?: string;
    prompt?: string;
  }): Promise<GenerateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.GENERATE_OUTRO_IMAGE, {
      kolImageUrl: params.kolImageUrl,
      kolImageName: params.kolImageName,
      kolImageDriveId: params.kolImageDriveId,
      prompt: params.prompt || 'Dynamic outdoor scene with natural lighting',
      backgroundType: 'outro',
    });
  },

  // Validate Intro Image (move TEMP → VALIDATED)
  validateIntroImage: async (fileId: string): Promise<ValidateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.VALIDATE_INTRO_IMAGE, {
      fileId,
      action: 'validate',
    });
  },

  // Validate Outro Image (move TEMP → VALIDATED)
  validateOutroImage: async (fileId: string): Promise<ValidateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.VALIDATE_OUTRO_IMAGE, {
      fileId,
      action: 'validate',
    });
  },

  // Generate Intro Video (save to TEMP)
  generateIntroVideo: async (params: {
    validatedImageId: string;
    prompt?: string;
    duration?: number;
  }): Promise<GenerateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.GENERATE_INTRO_VIDEO, {
      validatedImageId: params.validatedImageId,
      prompt: params.prompt || 'A professional person riding a Vespa scooter through modern city streets with dynamic camera movement',
      duration: params.duration || 5,
    });
  },

  // Generate Outro Video (save to TEMP)
  generateOutroVideo: async (params: {
    validatedImageId: string;
    prompt?: string;
    duration?: number;
  }): Promise<GenerateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.GENERATE_OUTRO_VIDEO, {
      validatedImageId: params.validatedImageId,
      prompt: params.prompt || 'A professional person riding a Vespa scooter through dynamic outdoor scene with cinematic movement',
      duration: params.duration || 5,
    });
  },

  // Validate Intro Video (move TEMP → VALIDATED)
  validateIntroVideo: async (fileId: string): Promise<ValidateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.VALIDATE_INTRO_VIDEO, {
      fileId,
      action: 'validate',
    });
  },

  // Validate Outro Video (move TEMP → VALIDATED)
  validateOutroVideo: async (fileId: string): Promise<ValidateImageResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.VALIDATE_OUTRO_VIDEO, {
      fileId,
      action: 'validate',
    });
  },

  // Assemble final video
  // mode "test": dùng example intro/outro + product videos có sẵn trong Drive
  // mode "production": dùng validatedIntroVideoId + validatedOutroVideoId từ Video Gen
  assembleVideo: async (params: {
    mode: 'test' | 'production';
    introVideoId?: string;
    outroVideoId?: string;
  }): Promise<AssembleVideoResponse> => {
    return apiCall(API_CONFIG.WEBHOOKS.ASSEMBLE_VIDEO, {
      mode: params.mode,
      introVideoId: params.introVideoId,
      outroVideoId: params.outroVideoId,
      // Folder IDs cho n8n biết lấy file từ đâu
      exampleFolderId: API_CONFIG.DRIVE_FOLDERS.EXAMPLE_VIDEOS,
      productFolderId: API_CONFIG.DRIVE_FOLDERS.PRODUCT_VIDEOS,
    });
  },
};
