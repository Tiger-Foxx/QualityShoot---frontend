export interface FileInfo {
    file_path: string;
    file_name: string;
    file_size: number;
    resolution?: [number, number];
    duration?: number;
    frames_count?: number;
    is_video: boolean;
}

export interface FileValidationResponse {
    valid_files: FileInfo[];
    invalid_files: Array<{ file: string; reason: string }>;
    total_valid: number;
    total_invalid: number;
}

export type SupportedImageExtensions = '.png' | '.jpg' | '.jpeg' | '.bmp' | '.tiff' | '.webp' | '.heic';
export type SupportedVideoExtensions = '.mp4' | '.mkv' | '.avi' | '.mov' | '.webm' | '.gif';

export interface PreviewData {
    originalPath: string;
    previewUrl?: string;
    estimatedOutputSize?: [number, number];
    estimatedFileSize?: number;
}