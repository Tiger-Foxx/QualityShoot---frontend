import type { FileInfo } from '../models/FileTypes';

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

export const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp', '.heic'];
    return imageExtensions.includes(getFileExtension(filename));
};

export const isVideoFile = (filename: string): boolean => {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.gif'];
    return videoExtensions.includes(getFileExtension(filename));
};

export const getFileName = (filePath: string): string => {
    return filePath.split(/[/\\]/).pop() || 'Unknown';
};

export const validateFileSize = (file: FileInfo, maxSizeMB: number = 100): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.file_size <= maxBytes;
};

export const groupFilesByType = (files: FileInfo[]): { images: FileInfo[], videos: FileInfo[] } => {
    return files.reduce(
        (acc, file) => {
            if (file.is_video) {
                acc.videos.push(file);
            } else {
                acc.images.push(file);
            }
            return acc;
        },
        { images: [] as FileInfo[], videos: [] as FileInfo[] }
    );
};