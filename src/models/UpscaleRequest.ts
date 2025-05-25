// Énumérations avec const au lieu d'enum
export const AIModel = {
  REALESR_GX4: "RealESR_Gx4",
  REALESR_ANIMEX4: "RealESR_Animex4",
  BSRGANX4: "BSRGANx4",
  REALESRGANX4: "RealESRGANx4",
  BSRGANX2: "BSRGANx2",
  IRCNN_MX1: "IRCNN_Mx1",
  IRCNN_LX1: "IRCNN_Lx1"
} as const;

export type AIModel = typeof AIModel[keyof typeof AIModel];

export const BlendingLevel = {
  OFF: "OFF",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
} as const;

export type BlendingLevel = typeof BlendingLevel[keyof typeof BlendingLevel];

export const VideoCodec = {
  X264: "x264",
  X265: "x265",
  H264_NVENC: "h264_nvenc",
  HEVC_NVENC: "hevc_nvenc",
  H264_AMF: "h264_amf",
  HEVC_AMF: "hevc_amf",
  H264_QSV: "h264_qsv",
  HEVC_QSV: "hevc_qsv"
} as const;

export type VideoCodec = typeof VideoCodec[keyof typeof VideoCodec];

export const GPU = {
  AUTO: "Auto",
  GPU1: "GPU 1",
  GPU2: "GPU 2",
  GPU3: "GPU 3",
  GPU4: "GPU 4"
} as const;

export type GPU = typeof GPU[keyof typeof GPU];

export const ProcessStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
  CANCELLED: "cancelled"
} as const;

export type ProcessStatus = typeof ProcessStatus[keyof typeof ProcessStatus];

export interface UpscaleRequest {
  file_paths: string[];
  ai_model: AIModel;
  input_resize_factor: number;
  output_resize_factor: number;
  gpu: GPU;
  vram_limit: number;
  blending: BlendingLevel;
  multithreading: number;
  output_path?: string;
  keep_frames: boolean;
  image_extension: string;
  video_extension: string;
  video_codec: VideoCodec;
}

export interface ProcessStatusResponse {
  process_id: string;
  status: ProcessStatus;
  progress: number;
  current_file?: string;
  current_step?: string;
  estimated_time_remaining?: number;
  error_message?: string;
  completed_files: string[];
  failed_files: string[];
}

export interface UpscaleResponse {
  process_id: string;
  status: ProcessStatus;
  message: string;
  files_info: import('./FileTypes').FileInfo[];
  estimated_time?: number;
  progress: number;
}