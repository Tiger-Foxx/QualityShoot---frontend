import React, { useState, useCallback, useEffect } from 'react';
import { Play, Square, AlertCircle, CheckCircle, Clock, Sparkles, FolderOpen } from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { useUpscale } from '../hooks/useUpscale';
import FileManager from '../components/FileManager';
import FilePreview from '../components/FilePreview';
import EnhancementSettings from '../components/EnhancementSettings';
import ProcessingStatus from '../components/ProcessingStatus';
import { electronService } from '../services/electronService';
import type { UpscaleRequest } from '../models';

const UpscalePage: React.FC = () => {
    const {
        selectedFiles,
        isLoading,
        error: fileError,
        selectFiles,
        addFiles,
        removeFile,
        clearFiles,
        getTotalSize,
        getFilesByType
    } = useFiles();

    const {
        isProcessing,
        progress,
        currentProcess,
        startUpscaling,
        cancelUpscaling,
        resetProcess,
        error: processError
    } = useUpscale();

    const [previewFile, setPreviewFile] = useState<any>(null);
    const [previewZoom, setPreviewZoom] = useState(100);
    const [enhancementSettings, setEnhancementSettings] = useState<Partial<UpscaleRequest>>({});
    const [processedImagePath, setProcessedImagePath] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Garde le dernier process pour accès au path de sortie
    const [lastOutputDir, setLastOutputDir] = useState<string | undefined>(undefined);

    // Reset complet de la sélection, preview et process
    const handleReset = useCallback(() => {
        resetProcess();
        clearFiles();
        setProcessedImagePath(null);
        setPreviewFile(null);
        setShowSuccessMessage(false);
        setLastOutputDir(undefined);
        setPreviewZoom(100);
    }, [resetProcess, clearFiles]);

    // Démarre un nouvel upscaling
    const handleStartUpscaling = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        setShowSuccessMessage(false);
        setProcessedImagePath(null);

        const request: UpscaleRequest = {
            file_paths: selectedFiles.map(f => f.file_path),
            ai_model: enhancementSettings.ai_model || 'RealESR_Gx4' as any,
            input_resize_factor: enhancementSettings.input_resize_factor || 1.0,
            output_resize_factor: enhancementSettings.output_resize_factor || 1.2,
            gpu: enhancementSettings.gpu || 'Auto' as any,
            vram_limit: enhancementSettings.vram_limit || 4.0,
            blending: enhancementSettings.blending || 'OFF' as any,
            multithreading: enhancementSettings.multithreading || 1,
            keep_frames: enhancementSettings.keep_frames || false,
            image_extension: enhancementSettings.image_extension || '.png',
            video_extension: enhancementSettings.video_extension || '.mp4',
            video_codec: enhancementSettings.video_codec || 'x264' as any,
            output_path: enhancementSettings.output_path
        };

        // Enregistre le path de sortie pour "Ouvrir dossier"
        setLastOutputDir(enhancementSettings.output_path);

        const processId = await startUpscaling(request);
        if (processId) {
            // Rien à faire ici, le polling commence
        }
    }, [selectedFiles, enhancementSettings, startUpscaling]);

    // Preview auto après upscaling (si image unique)
    useEffect(() => {
        if (!currentProcess) return;

        const isCompleted = currentProcess.status === 'completed';
        if (isCompleted && !showSuccessMessage) {
            setShowSuccessMessage(true);

            // Si une seule image et un seul fichier traité => preview auto
            if (
                currentProcess.completed_files &&
                currentProcess.completed_files.length === 1 &&
                selectedFiles.length === 1 &&
                !selectedFiles[0].is_video
            ) {
                setProcessedImagePath(currentProcess.completed_files[0]);
                setPreviewFile({
                    ...selectedFiles[0],
                    file_path: currentProcess.completed_files[0]
                });
            } else {
                setProcessedImagePath(null);
            }

            // Path de sortie pour bouton "Ouvrir dossier"
            if (enhancementSettings.output_path) {
                setLastOutputDir(enhancementSettings.output_path);
            } else if (selectedFiles.length > 0) {
                // Si pas de output_path custom, dossier du 1er fichier
                setLastOutputDir(selectedFiles[0].file_path ?
                    selectedFiles[0].file_path.replace(/[/\\][^/\\]+$/, '') : undefined
                );
            }

            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [currentProcess, showSuccessMessage, selectedFiles, enhancementSettings.output_path]);

    // Ajoute "Ouvrir dossier" via Electron (ou fallback)
    const handleOpenOutputDir = useCallback(() => {
        if (lastOutputDir) {
            electronService.openFolder(lastOutputDir);
        }
    }, [lastOutputDir]);

    const filesByType = getFilesByType();
    const totalSize = getTotalSize();
    const isCompleted = currentProcess?.status === 'completed';
    const hasErrors = currentProcess?.status === 'error' || fileError || processError;

    // Détermine si on propose un bouton "Nouveau traitement"
    const canStartNew = !isProcessing && (isCompleted || hasErrors);

    return (
        <div className="h-full flex bg-[#1e1e1e] relative">
            {/* Files Manager */}
            <FileManager
                selectedFiles={selectedFiles}
                isLoading={isLoading}
                error={fileError}
                onSelectFiles={selectFiles}
                onAddFiles={addFiles}
                onRemoveFile={removeFile}
                onClearFiles={clearFiles}
                onFilePreview={setPreviewFile}
                previewFile={previewFile}
                totalSize={totalSize}
                filesByType={filesByType}
            />

            {/* Preview Panel */}
            <div className="flex-1 bg-[#1e1e1e] flex flex-col relative">
                <FilePreview
                    file={previewFile}
                    zoom={previewZoom}
                    onZoomChange={setPreviewZoom}
                    isProcessing={isProcessing}
                    processedImagePath={processedImagePath}
                />

                {/* Processing Status Overlay */}
                {isProcessing && (
                    <ProcessingStatus
                        progress={progress}
                        currentProcess={currentProcess}
                        onCancel={cancelUpscaling}
                        onReset={handleReset}
                    />
                )}
            </div>

            {/* Enhancement Settings */}
            <EnhancementSettings
                onSettingsChange={setEnhancementSettings}
                isProcessing={isProcessing}
                selectedFilesCount={selectedFiles.length}
            />

            {/* Enhanced Process Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center space-x-6">
                        {/* MAIN ACTION BUTTON */}
                        {isProcessing ? (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={cancelUpscaling}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors font-semibold shadow-lg"
                                >
                                    <Square size={20} />
                                    <span>Cancel</span>
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                                        <Clock size={16} className="text-white" />
                                    </div>
                                    <div className="text-white">
                                        <div className="font-bold text-lg">Processing...</div>
                                        <div className="text-gray-300 text-sm">{Math.round(progress)}% complete</div>
                                    </div>
                                </div>
                            </div>
                        ) : canStartNew ? (
                            <button
                                onClick={handleReset}
                                className="relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                                <Sparkles size={24} />
                                <span>Enhance More Files</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStartUpscaling}
                                disabled={selectedFiles.length === 0 || isLoading}
                                className={`relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
                                    selectedFiles.length === 0 || isLoading
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                                }`}
                            >
                                <Play size={24} />
                                <span>
                                    {selectedFiles.length === 0
                                        ? 'Select files to start'
                                        : `Enhance ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                                    }
                                </span>
                            </button>
                        )}

                        {/* Status Indicator */}
                        {!isProcessing && (
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    hasErrors ? 'bg-red-400' :
                                        isCompleted ? 'bg-green-400 animate-pulse' :
                                            'bg-blue-400'
                                }`} />
                                <span className={`text-sm font-medium ${
                                    hasErrors ? 'text-red-300' :
                                        isCompleted ? 'text-green-300' :
                                            'text-blue-300'
                                }`}>
                                    {hasErrors ? 'Error' :
                                        isCompleted ? 'Ready' :
                                            'Ready to enhance'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {hasErrors && (
                        <div className="mt-4 bg-red-900/50 border border-red-600 rounded-xl p-4 flex items-center space-x-3">
                            <AlertCircle size={20} className="text-red-300 flex-shrink-0" />
                            <div className="text-red-300">
                                <div className="font-semibold">Error occurred:</div>
                                <div className="text-sm mt-1">{fileError || processError}</div>
                            </div>
                        </div>
                    )}

                    {/* Success Summary + open dir */}
                    {isCompleted && !hasErrors && (
                        <div className="mt-4 bg-green-900/50 border border-green-600 rounded-xl p-4 flex flex-col space-y-2">
                            <div className="flex items-center space-x-3">
                                <CheckCircle size={20} className="text-green-300 flex-shrink-0" />
                                <div className="text-green-300">
                                    <div className="font-semibold">Enhancement completed successfully!</div>
                                    <div className="text-sm mt-1">
                                        {currentProcess?.completed_files?.length || 0} files enhanced,
                                        {currentProcess?.failed_files?.length || 0} failed
                                    </div>
                                </div>
                            </div>
                            {/* Bouton ouvrir dossier */}
                            <button
                                onClick={handleOpenOutputDir}
                                className="flex items-center mt-2 justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg space-x-2 transition"
                                type="button"
                            >
                                <FolderOpen size={18} />
                                <span>Ouvrir le dossier de sortie</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpscalePage;