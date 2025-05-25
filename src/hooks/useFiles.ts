import { useState, useCallback } from 'react';
import { electronService } from '../services/electronService';
import { apiService } from '../services/apiService';
import type { FileInfo, FileValidationResponse } from '../models';

interface UseFilesResult {
    selectedFiles: FileInfo[];
    isLoading: boolean;
    error: string | null;
    selectFiles: () => Promise<void>;
    removeFile: (filePath: string) => void;
    clearFiles: () => void;
    validateFiles: (filePaths: string[]) => Promise<void>;
    getTotalSize: () => number;
    getFilesByType: () => { images: FileInfo[], videos: FileInfo[] };
}

export const useFiles = (): UseFilesResult => {
    const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectFiles = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            // Utiliser Electron pour sélectionner les fichiers
            const filePaths = await electronService.selectFiles();

            if (filePaths.length === 0) {
                setIsLoading(false);
                return;
            }

            // Valider les fichiers via l'API
            await validateFiles(filePaths);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sélection des fichiers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const validateFiles = useCallback(async (filePaths: string[]): Promise<void> => {
        try {
            setIsLoading(true);

            const validation: FileValidationResponse = await apiService.validateFiles(filePaths);

            if (validation.invalid_files.length > 0) {
                console.warn('Fichiers invalides:', validation.invalid_files);
            }

            setSelectedFiles(validation.valid_files);

            if (validation.valid_files.length === 0) {
                setError('Aucun fichier valide trouvé');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la validation des fichiers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeFile = useCallback((filePath: string): void => {
        setSelectedFiles(prev => prev.filter(file => file.file_path !== filePath));
    }, []);

    const clearFiles = useCallback((): void => {
        setSelectedFiles([]);
        setError(null);
    }, []);

    const getTotalSize = useCallback((): number => {
        return selectedFiles.reduce((total, file) => total + file.file_size, 0);
    }, [selectedFiles]);

    const getFilesByType = useCallback(() => {
        return selectedFiles.reduce(
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
    }, [selectedFiles]);

    return {
        selectedFiles,
        isLoading,
        error,
        selectFiles,
        removeFile,
        clearFiles,
        validateFiles,
        getTotalSize,
        getFilesByType
    };
};