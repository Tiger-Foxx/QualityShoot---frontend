import React, { useEffect, useState } from 'react';
import { Square, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Lottie from 'lottie-react';
// import foxLoader from '../assets/lotties/fox-loader.json';
import type { ProcessStatusResponse } from '../models';

interface ProcessingStatusProps {
    progress: number; // conservé pour compatibilité (non utilisé)
    currentProcess: ProcessStatusResponse | null;
    onCancel: () => Promise<void>;
    onReset: () => void;
}

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'completed': return 'green';
        case 'error': return 'red';
        case 'cancelled': return 'yellow';
        default: return 'blue';
    }
};

const getStatusIcon = (status?: string) => {
    switch (status) {
        case 'completed': return <CheckCircle size={24} className="text-green-400" />;
        case 'error': return <XCircle size={24} className="text-red-400" />;
        case 'cancelled': return <Square size={24} className="text-yellow-400" />;
        default: return <Clock size={24} className="text-blue-400" />;
    }
};

const TimeElapsed: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!isActive) return;
        setElapsed(0);
        const start = Date.now();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);
    // Format: mm:ss
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return (
        <div className="flex items-center justify-center mt-2">
            <span className="text-xs text-gray-400">Temps écoulé :</span>
            <span className="ml-2 text-white font-mono text-xs">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
        </div>
    );
};

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
                                                               progress, // unused, but kept for interface compatibility
                                                               currentProcess,
                                                               onCancel,
                                                               onReset
                                                           }) => {
    if (!currentProcess) return null;

    const isProcessing = currentProcess.status === 'processing' || currentProcess.status === 'pending';
    const color = getStatusColor(currentProcess.status);

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <div className="bg-[#232323] border border-gray-700 rounded-2xl shadow-xl p-7 max-w-md w-full mx-4 relative overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(currentProcess.status)}
                        <h3 className="text-white font-semibold text-lg tracking-wide">
                            Traitement en cours
                        </h3>
                    </div>
                </div>

                {/* Fox Lottie Animation OR Status Icon */}
                <div className="flex items-center justify-center mb-5 min-h-[80px]">
                    {isProcessing ? (
                        <div className="w-20 h-20">
                            <Lottie animationData={"/assets/lotties/fox-loader.json"} loop={true} />
                        </div>
                    ) : (
                        getStatusIcon(currentProcess.status)
                    )}
                </div>

                {/* Current File */}
                {currentProcess.current_file && (
                    <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-1">Fichier en cours :</div>
                        <div className="text-white font-medium truncate">
                            📄 {currentProcess.current_file}
                        </div>
                    </div>
                )}

                {/* Current Step */}
                {currentProcess.current_step && (
                    <div className="mb-5">
                        <div className="text-xs text-gray-400 mb-1">Étape :</div>
                        <div className="text-green-400 text-sm font-mono break-words">
                            ⚙️ {currentProcess.current_step}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-[#303030] rounded-lg p-2">
                        <div className="text-green-400 font-bold text-lg">{currentProcess.completed_files.length}</div>
                        <div className="text-xs text-gray-400">Terminés</div>
                    </div>
                    <div className="bg-[#303030] rounded-lg p-2">
                        <div className="text-red-400 font-bold text-lg">{currentProcess.failed_files.length}</div>
                        <div className="text-xs text-gray-400">Échoués</div>
                    </div>
                    <div className="bg-[#303030] rounded-lg p-2">
                        <div className="text-blue-400 font-bold text-lg">
                            {(currentProcess.completed_files.length + currentProcess.failed_files.length)}
                        </div>
                        <div className="text-xs text-gray-400">Traités</div>
                    </div>
                </div>

                {/* Animated "Veuillez patienter" + Time elapsed */}
                {isProcessing && (
                    <div className="flex flex-col items-center mb-4">
                        <span className="flex items-center gap-2 text-blue-300 text-sm font-semibold animate-pulse">
                            <Clock size={16} className="animate-bounce-slow" />
                            Veuillez patienter, traitement en cours...
                        </span>
                        <TimeElapsed isActive={isProcessing} />
                    </div>
                )}

                {/* Time Estimate (if present and not processing) */}
                {!isProcessing && currentProcess.estimated_time_remaining && (
                    <div className="mb-4 text-center">
                        <div className="text-xs text-gray-400">Temps restant estimé :</div>
                        <div className="text-white font-medium">
                            {Math.round(currentProcess.estimated_time_remaining / 60)} minutes
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {currentProcess.error_message && (
                    <div className="mt-4 bg-red-900/60 border border-red-600 rounded-lg p-3">
                        <div className="text-red-200 text-sm font-semibold">
                            <strong>Erreur :</strong> {currentProcess.error_message}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                    {isProcessing ? (
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold"
                        >
                            <Square size={18} />
                            <span>Annuler le traitement</span>
                        </button>
                    ) : (
                        <button
                            onClick={onReset}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold"
                        >
                            <RotateCcw size={18} />
                            <span>Nouveau traitement</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessingStatus;