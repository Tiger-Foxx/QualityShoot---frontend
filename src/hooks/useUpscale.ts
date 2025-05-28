import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';
import type {
    UpscaleRequest,
    UpscaleResponse,
    ProcessStatusResponse,
    ProcessStatus
} from '../models';

interface UseUpscaleResult {
    isProcessing: boolean;
    currentProcess: ProcessStatusResponse | null;
    error: string | null;
    startUpscaling: (request: UpscaleRequest) => Promise<string | null>;
    cancelUpscaling: () => Promise<void>;
    resetProcess: () => void;
    progress: number;
}

export const useUpscale = (): UseUpscaleResult => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentProcess, setCurrentProcess] = useState<ProcessStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentProcessIdRef = useRef<string | null>(null);

    const pollProcessStatus = useCallback(async (processId: string) => {
        try {
            const status = await apiService.getProcessStatus(processId);
            setCurrentProcess(status);
            setProgress(status.progress);

            // Arrêter le polling si le processus est terminé
            if (status.status === 'completed' || status.status === 'error' || status.status === 'cancelled') {
                setIsProcessing(false);
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }

                if (status.status === 'error') {
                    setError(status.error_message || 'Erreur inconnue');
                }
            }
        } catch (err) {
            console.error('Erreur polling:', err);
            setError('Erreur de communication avec le serveur');
            setIsProcessing(false);
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        }
    }, []);

    const startUpscaling = useCallback(async (request: UpscaleRequest): Promise<string | null> => {
        try {
            setError(null);
            setIsProcessing(true);
            setProgress(0);

            // Valider la connexion au serveur
            const isReachable = await apiService.isServerReachable();
            if (!isReachable) {
                throw new Error('Le serveur backend n\'est pas accessible');
            }

            // Démarrer l'upscaling
            const response: UpscaleResponse = await apiService.startUpscaling(request);
            currentProcessIdRef.current = response.process_id;

            // Commencer le polling du statut
            pollIntervalRef.current = setInterval(
                () => pollProcessStatus(response.process_id),
                1000 // Poll chaque seconde
            );

            return response.process_id;
        } catch (err: any) {
            setError(err.message || 'Erreur lors du démarrage de l\'upscaling');
            setIsProcessing(false);
            return null;
        }
    }, [pollProcessStatus]);

    const cancelUpscaling = useCallback(async (): Promise<void> => {
        try {
            if (currentProcessIdRef.current) {
                await apiService.cancelProcess(currentProcessIdRef.current);
                setIsProcessing(false);
                setProgress(0);

                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'annulation');
        }
    }, []);

    const resetProcess = useCallback(() => {
        setIsProcessing(false);
        setCurrentProcess(null);
        setError(null);
        setProgress(0);

        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }

        currentProcessIdRef.current = null;
    }, []);

    return {
        isProcessing,
        currentProcess,
        error,
        startUpscaling,
        cancelUpscaling,
        resetProcess,
        progress
    };
};