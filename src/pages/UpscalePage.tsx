import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    FolderOpen,
    X,
    ImageIcon,
    Video,
    Play,
    Settings,
    Trash2,
    Download,
    Eye,
    ZoomIn,
    Layers,
    Sliders,
    Cpu,
    HardDrive,
    RotateCcw,
    Maximize2
} from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { useUpscale } from '../hooks/useUpscale';
import { AIModel } from '../models';
import type { UpscaleRequest } from '../models';

const QUALITY_PRESETS = {
    standard: {
        name: "Standard Quality",
        description: "Balanced enhancement for general use",
        model: AIModel.REALESR_GX4,
        settings: { input: 1.0, output: 1.0, vram: 4 }
    },
    high: {
        name: "High Quality",
        description: "Maximum quality for important images",
        model: AIModel.REALESR_GX4,
        settings: { input: 1.0, output: 1.5, vram: 6 }
    },
    anime: {
        name: "Anime/Illustration",
        description: "Optimized for drawn content",
        model: AIModel.REALESR_ANIMEX4,
        settings: { input: 1.0, output: 1.0, vram: 4 }
    }
};

const UpscalePage: React.FC = () => {
    const {
        selectedFiles,
        isLoading,
        error: fileError,
        selectFiles,
        removeFile,
        clearFiles
    } = useFiles();

    const {
        isProcessing,
        progress,
        currentProcess,
        startUpscaling,
        error: processError
    } = useUpscale();

    const [selectedPreset, setSelectedPreset] = useState<keyof typeof QUALITY_PRESETS>('standard');
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [previewZoom, setPreviewZoom] = useState(100);
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

    const handleFileSelect = useCallback(async () => {
        await selectFiles();
    }, [selectFiles]);

    // Charger la preview quand un fichier est sélectionné
    useEffect(() => {
        if (previewFile && !previewFile.is_video) {
            loadImagePreview(previewFile.file_path);
            console.log("VALEUR DE L'IMAGE DANS LA PREVIEW : ", previewFile.file_path)
        } else {
            setPreviewDataUrl(null);
        }
    }, [previewFile]);

    const loadImagePreview = async (filePath: string) => {
        try {
            console.log('🖼️ Chargement preview pour:', filePath);

            // Méthode 1: Utiliser fetch avec file:// protocol
            const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
            console.log("VALEUR DE FILEURL POUR LE FETCH : ",fileUrl)

            try {
                const response = await fetch(fileUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const dataUrl = await blobToDataUrl(blob);
                    setPreviewDataUrl(dataUrl);
                    console.log('✅ Preview chargée avec fetch');
                    return;
                }
            } catch (e) {
                console.log('⚠️ Fetch failed, trying FileReader...');
            }

            // Méthode 2: Si on est dans Electron, utiliser l'API native
            if ((window as any).electronAPI) {
                // Cette méthode nécessite d'ajouter une fonction à preload.cjs
                try {
                    const base64 = await (window as any).electronAPI.readFileAsBase64(filePath);
                    if (base64) {
                        setPreviewDataUrl(`data:image/jpeg;base64,${base64}`);
                        console.log('✅ Preview chargée avec Electron API');
                        return;
                    }
                } catch (e) {
                    console.log('⚠️ Electron API failed');
                }
            }

            // Méthode 3: Essayer de créer un ObjectURL via input file
            console.log('❌ Toutes les méthodes ont échoué');
            setPreviewDataUrl(null);

        } catch (error) {
            console.error('❌ Erreur chargement preview:', error);
            setPreviewDataUrl(null);
        }
    };

    const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleStartUpscaling = async () => {
        if (selectedFiles.length === 0) return;

        const preset = QUALITY_PRESETS[selectedPreset];

        const request: UpscaleRequest = {
            file_paths: selectedFiles.map(f => f.file_path),
            ai_model: preset.model,
            input_resize_factor: preset.settings.input,
            output_resize_factor: preset.settings.output,
            gpu: 'Auto' as any,
            vram_limit: preset.settings.vram,
            blending: 'OFF' as any,
            multithreading: 1,
            keep_frames: false,
            image_extension: '.png',
            video_extension: '.mp4',
            video_codec: 'x264' as any
        };

        await startUpscaling(request);
    };

    const getFilePreview = (file: any) => {
        if (file.is_video) {
            return (
                <div className="w-full h-full bg-gray-800 rounded flex flex-col items-center justify-center text-gray-400">
                    <Video size={20} />
                    <span className="text-xs mt-1">Video</span>
                </div>
            );
        }

        return (
            <div className="w-full h-full bg-gray-800 rounded flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={20} />
                <span className="text-xs mt-1">Image</span>
            </div>
        );
    };

    return (
        <div className="h-full flex bg-[#1e1e1e]">
            {/* Sidebar gauche - Files Panel */}
            <div className="w-80 bg-[#2d2d2d] border-r border-gray-600 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center space-x-3 mb-3">
                        <Layers className="text-blue-400" size={20} />
                        <h2 className="text-white font-semibold">Files</h2>
                        <div className="flex-1" />
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {selectedFiles.length}
            </span>
                    </div>

                    <button
                        onClick={handleFileSelect}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium"
                    >
                        <FolderOpen size={16} />
                        <span>{isLoading ? 'Loading...' : 'Import Files'}</span>
                    </button>
                </div>

                {/* Files List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {selectedFiles.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ImageIcon size={32} className="opacity-50" />
                            </div>
                            <h3 className="font-medium mb-2">No files selected</h3>
                            <p className="text-sm opacity-75">Import images or videos to enhance</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Stats Bar */}
                            <div className="bg-[#383838] rounded-lg p-3 border border-gray-600">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-white">{selectedFiles.length}</div>
                                        <div className="text-xs text-gray-400">Files</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-blue-400">
                                            {(selectedFiles.reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024).toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">MB</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-green-400">
                                            {selectedFiles.filter(f => !f.is_video).length}
                                        </div>
                                        <div className="text-xs text-gray-400">Images</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleFileSelect}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                                >
                                    Add More
                                </button>
                                <button
                                    onClick={clearFiles}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                    title="Clear All"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* File list */}
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={file.file_path}
                                        className={`bg-[#383838] hover:bg-[#404040] rounded-lg p-3 cursor-pointer transition-all group border-2 ${
                                            previewFile?.file_path === file.file_path
                                                ? 'border-blue-500 bg-blue-900/20'
                                                : 'border-transparent'
                                        }`}
                                        onClick={() => setPreviewFile(file)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {/* Thumbnail simplifié */}
                                            <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                                                {getFilePreview(file)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium truncate">{file.file_name}</div>
                                                <div className="text-gray-400 text-xs flex items-center space-x-2">
                                                    <span>{(file.file_size / 1024 / 1024).toFixed(1)}MB</span>
                                                    {file.resolution && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{file.resolution[0]}×{file.resolution[1]}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                                        file.is_video ? 'bg-blue-400' : 'bg-green-400'
                                                    }`} />
                                                    <span className="text-xs text-gray-500">
                            {file.is_video ? 'Video' : 'Image'}
                          </span>
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(file.file_path);
                                                    if (previewFile?.file_path === file.file_path) {
                                                        setPreviewFile(selectedFiles[0] !== file ? selectedFiles[0] : null);
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {fileError && (
                        <div className="mt-4 bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-300 text-sm">
                            <strong>Error:</strong> {fileError}
                        </div>
                    )}
                </div>
            </div>

            {/* Centre - Preview Panel */}
            <div className="flex-1 bg-[#1e1e1e] flex flex-col">
                {/* Preview Header */}
                <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Eye className="text-purple-400" size={20} />
                            <h2 className="text-white font-semibold">Preview</h2>
                            {previewFile && (
                                <span className="text-sm text-gray-400">
                  {previewFile.file_name}
                </span>
                            )}
                        </div>
                        {previewFile && (
                            <div className="flex items-center space-x-2">
                                <div className="text-xs text-gray-400">
                                    Path: {previewFile.file_path}
                                </div>
                                <button
                                    onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomIn size={16} className="rotate-180" />
                                </button>
                                <span className="text-xs text-gray-400 min-w-[3rem] text-center">
                  {previewZoom}%
                </span>
                                <button
                                    onClick={() => setPreviewZoom(Math.min(400, previewZoom + 25))}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    onClick={() => setPreviewZoom(100)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                    title="Reset Zoom"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-[#151515]">
                    {previewFile ? (
                        <div className="max-w-full max-h-full flex items-center justify-center">
                            {previewFile.is_video ? (
                                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-600">
                                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Video className="text-blue-400" size={32} />
                                    </div>
                                    <h3 className="text-white font-medium mb-2">Video Preview</h3>
                                    <p className="text-gray-400 text-sm">Video preview not implemented yet</p>
                                    <p className="text-gray-500 text-xs mt-2">{previewFile.file_name}</p>
                                </div>
                            ) : previewDataUrl ? (
                                <img
                                    src={previewDataUrl}
                                    alt={previewFile.file_name}
                                    className="rounded-lg shadow-2xl border border-gray-600"
                                    style={{
                                        maxHeight: '80vh',
                                        maxWidth: '90vw',
                                        transform: `scale(${previewZoom / 100})`,
                                        transformOrigin: 'center'
                                    }}
                                />
                            ) : (
                                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-600">
                                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="text-green-400" size={32} />
                                    </div>
                                    <h3 className="text-white font-medium mb-2">Loading preview...</h3>
                                    <p className="text-gray-400 text-sm">File: {previewFile.file_name}</p>
                                    <p className="text-gray-500 text-xs mt-2">Path: {previewFile.file_path}</p>
                                    <button
                                        onClick={() => loadImagePreview(previewFile.file_path)}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                    >
                                        Retry Loading
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <div className="w-24 h-24 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ImageIcon size={48} className="opacity-30" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No preview</h3>
                            <p className="opacity-75">Select a file to preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar droite - Settings Panel (reste identique) */}
            <div className="w-80 bg-[#2d2d2d] border-l border-gray-600 flex flex-col">
                {/* Settings Header */}
                <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center space-x-3">
                        <Sliders className="text-green-400" size={20} />
                        <h2 className="text-white font-semibold">Enhancement</h2>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-4 overflow-y-auto space-y-6">
                    {/* Quality Presets */}
                    <div>
                        <h3 className="text-white font-medium mb-3">Quality Preset</h3>
                        <div className="space-y-2">
                            {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedPreset(key as keyof typeof QUALITY_PRESETS)}
                                    className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                                        selectedPreset === key
                                            ? 'border-blue-500 bg-blue-900/30 text-white'
                                            : 'border-gray-600 bg-[#383838] text-gray-300 hover:bg-[#404040] hover:border-gray-500'
                                    }`}
                                >
                                    <div className="font-medium">{preset.name}</div>
                                    <div className="text-sm opacity-75 mt-1">{preset.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-[#383838] rounded-lg p-4 border border-gray-600">
                        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                            <Cpu size={16} />
                            <span>System Status</span>
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">GPU Memory</span>
                                <span className="text-white font-medium">{QUALITY_PRESETS[selectedPreset].settings.vram}GB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">AI Model</span>
                                <span className="text-white text-xs font-mono bg-gray-700 px-2 py-1 rounded">
                  {QUALITY_PRESETS[selectedPreset].model}
                </span>
                            </div>
                            <div className="pt-2 border-t border-gray-600">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-green-400 text-xs">System Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Process Button */}
                    <div className="pt-4 border-t border-gray-600">
                        {!isProcessing ? (
                            <button
                                onClick={handleStartUpscaling}
                                disabled={selectedFiles.length === 0}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100"
                            >
                                <Play size={20} />
                                <span>
                  {selectedFiles.length === 0
                      ? 'Import files to start'
                      : `Enhance ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                  }
                </span>
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-[#383838] rounded-lg p-4 border border-gray-600">
                                    <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Processing...</span>
                    </span>
                                        <span className="text-green-400 font-bold">{Math.round(progress)}%</span>
                                    </div>

                                    <div className="w-full bg-gray-600 rounded-full h-2 mb-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {currentProcess?.current_file && (
                                        <div className="text-sm text-gray-300 truncate">
                                            📄 {currentProcess.current_file}
                                        </div>
                                    )}

                                    {currentProcess?.current_step && (
                                        <div className="text-xs text-green-400 mt-1">
                                            ⚙️ {currentProcess.current_step}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Errors */}
                    {(fileError || processError) && (
                        <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                            <div className="text-red-300 text-sm">
                                <strong>Error:</strong> {fileError || processError}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpscalePage;