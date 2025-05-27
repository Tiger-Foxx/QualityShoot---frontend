import { useState, useCallback } from 'react';
import { electronService } from '../services/electronService';
import { apiService } from '../services/apiService';
import type { FileInfo, FileValidationResponse } from '../models';

interface UseFilesResult {
    selectedFiles: FileInfo[];
    isLoading: boolean;
    error: string | null;
    selectFiles: () => Promise<void>;
    selectFilesVideo: () => Promise<void>;
    addFiles: () => Promise<void>; // NOUVELLE FONCTION
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

            const filePaths = await electronService.selectFiles();
            if (filePaths.length === 0) {
                setIsLoading(false);
                return;
            }

            // REMPLACER les fichiers existants
            await validateFiles(filePaths);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sélection des fichiers');
        } finally {
            setIsLoading(false);
        }
    }, []);
    const selectFilesVideo = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const filePaths = await electronService.selectFilesVideo();
            if (filePaths.length === 0) {
                setIsLoading(false);
                return;
            }

            // REMPLACER les fichiers existants
            await validateFiles(filePaths);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sélection des fichiers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addFiles = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const filePaths = await electronService.selectFiles();
            if (filePaths.length === 0) {
                setIsLoading(false);
                return;
            }

            // AJOUTER aux fichiers existants
            const existingPaths = selectedFiles.map(f => f.file_path);
            const newPaths = filePaths.filter(path => !existingPaths.includes(path));

            if (newPaths.length === 0) {
                setError('Ces fichiers sont déjà sélectionnés');
                setIsLoading(false);
                return;
            }

            const validation: FileValidationResponse = await apiService.validateFiles(newPaths);

            if (validation.invalid_files.length > 0) {
                console.warn('Fichiers invalides:', validation.invalid_files);
            }

            // Ajouter les nouveaux fichiers valides
            setSelectedFiles(prev => [...prev, ...validation.valid_files]);

            if (validation.valid_files.length === 0) {
                setError('Aucun nouveau fichier valide trouvé');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'ajout des fichiers');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFiles]);

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
        addFiles, // EXPOSER la nouvelle fonction
        removeFile,
        clearFiles,
        validateFiles,
        getTotalSize,
        getFilesByType
    };
};