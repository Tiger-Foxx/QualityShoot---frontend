// Utilitaires validation
import type { UpscaleRequest } from '../models/UpscaleRequest';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateUpscaleRequest = (request: Partial<UpscaleRequest>): ValidationResult => {
    const errors: string[] = [];

    if (!request.file_paths || request.file_paths.length === 0) {
        errors.push('Aucun fichier sélectionné');
    }

    if (!request.ai_model) {
        errors.push('Modèle IA non sélectionné');
    }

    if (request.input_resize_factor && (request.input_resize_factor <= 0 || request.input_resize_factor > 2)) {
        errors.push('Le facteur de redimensionnement d\'entrée doit être entre 0.1 et 2.0');
    }

    if (request.output_resize_factor && (request.output_resize_factor <= 0 || request.output_resize_factor > 2)) {
        errors.push('Le facteur de redimensionnement de sortie doit être entre 0.1 et 2.0');
    }

    if (request.vram_limit && (request.vram_limit < 1 || request.vram_limit > 24)) {
        errors.push('La limite VRAM doit être entre 1 et 24 GB');
    }

    if (request.multithreading && (request.multithreading < 1 || request.multithreading > 8)) {
        errors.push('Le nombre de threads doit être entre 1 et 8');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[<>:"/\\|?*]/g, '_');
};

export const isValidPath = (path: string): boolean => {
    try {
        // Vérification basique du chemin
        return path.length > 0 && !/[<>:"|?*]/.test(path);
    } catch {
        return false;
    }
};