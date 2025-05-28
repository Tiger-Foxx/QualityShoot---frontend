import React, { useState, useEffect } from 'react';
import {
    ImageIcon, Video, ZoomIn, ZoomOut, RotateCcw, Eye, Download,
    Maximize2, Play, Pause, FileText, Sparkles, ArrowRight
} from 'lucide-react';
import type { FileInfo } from '../models';

interface FilePreviewProps {
    file: FileInfo | null;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    isProcessing?: boolean;
    processedImagePath?: string | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({
                                                     file,
                                                     zoom,
                                                     onZoomChange,
                                                     isProcessing = false,
                                                     processedImagePath = null
                                                 }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    useEffect(() => {
        if (file && !file.is_video) {
            loadPreview(file.file_path);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    useEffect(() => {
        if (processedImagePath) {
            console.log('Loading processed image from:', processedImagePath);
            loadProcessedPreview(processedImagePath);
        } else {
            setProcessedPreviewUrl(null);
        }
    }, [processedImagePath]);

    const loadPreview = async (filePath: string) => {
        try {
            setIsLoading(true);

            // Utiliser l'API Electron pour lire le fichier
            if ((window as any).electronAPI?.readFileAsBase64) {
                const base64 = await (window as any).electronAPI.readFileAsBase64(filePath);
                if (base64) {
                    // Détecter le type d'image
                    const extension = filePath.toLowerCase().split('.').pop();
                    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                    setPreviewUrl(`data:${mimeType};base64,${base64}`);
                    return;
                }
            }

            // Fallback: servir via l'API backend
            const filename = filePath.split('\\').pop() || filePath.split('/').pop();
            if (filename) {
                setPreviewUrl(`http://127.0.0.1:8000/static/preview/${filename}`);
            }

        } catch (error) {
            console.error('Erreur chargement preview:', error);
            setPreviewUrl(null);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProcessedPreview = async (filePath: string) => {
        try {
            if ((window as any).electronAPI?.readFileAsBase64) {
                const base64 = await (window as any).electronAPI.readFileAsBase64(filePath);
                if (base64) {
                    const extension = filePath.toLowerCase().split('.').pop();
                    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                    setProcessedPreviewUrl(`data:${mimeType};base64,${base64}`);
                }
            }
        } catch (error) {
            console.error('Erreur chargement preview traité:', error);
        }
    };

    if (!file) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center text-gray-400 max-w-md">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <Eye size={64} className="opacity-30" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        No Preview Available
                    </h3>
                    <p className="text-lg opacity-75 leading-relaxed">
                        Select a file from the left panel to see a beautiful preview here
                    </p>
                </div>
            </div>
        );
    }

    if (file.is_video) {
        return (
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Video className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{file.file_name}</h2>
                                <p className="text-blue-400 text-sm">Video File</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Preview */}
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 text-center border border-gray-600 shadow-2xl max-w-lg">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Video className="text-white" size={48} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4">Video Processing</h3>
                        <p className="text-gray-300 text-lg mb-6">
                            Video enhancement is coming soon with advanced AI upscaling
                        </p>

                        {/* Video Info */}
                        <div className="grid grid-cols-1 gap-4 bg-gray-800/50 rounded-xl p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Resolution:</span>
                                <span className="text-white font-mono bg-gray-700 px-3 py-1 rounded">
                                    {file.resolution ? `${file.resolution[0]}×${file.resolution[1]}` : 'Unknown'}
                                </span>
                            </div>
                            {file.duration && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Duration:</span>
                                    <span className="text-white font-mono bg-gray-700 px-3 py-1 rounded">
                                        {Math.floor(file.duration / 60)}:{(file.duration % 60).toFixed(0).padStart(2, '0')}
                                    </span>
                                </div>
                            )}
                            {file.frames_count && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Frames:</span>
                                    <span className="text-white font-mono bg-gray-700 px-3 py-1 rounded">
                                        {file.frames_count.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <ImageIcon className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{file.file_name.slice(0,20)} ...</h2>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                                <span>Image File</span>
                                {file.resolution && (
                                    <>
                                        <span>•</span>
                                        <span className="font-mono">{file.resolution[0]}×{file.resolution[1]}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-3">
                        {processedPreviewUrl && (
                            <button
                                onClick={() => setShowComparison(!showComparison)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    showComparison
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                }`}
                            >
                                {showComparison ? 'Hide' : 'Show'} Comparison
                            </button>
                        )}

                        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                            <button
                                onClick={() => onZoomChange(Math.max(25, zoom - 25))}
                                className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-sm text-gray-300 min-w-[3rem] text-center font-mono">
                                {zoom}%
                            </span>
                            <button
                                onClick={() => onZoomChange(Math.min(400, zoom + 25))}
                                className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <button
                                onClick={() => onZoomChange(100)}
                                className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 to-black">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 text-center border border-gray-600 shadow-2xl">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <ImageIcon className="text-white" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Loading Preview...</h3>
                            <p className="text-gray-400">Please wait while we load your image</p>
                        </div>
                    </div>
                ) : showComparison && previewUrl && processedPreviewUrl ? (
                    <div className="h-full p-6">
                        <div className="h-full grid grid-cols-2 gap-6">
                            {/* Original */}
                            <div className="flex flex-col bg-gray-800 rounded-xl border border-gray-600 overflow-hidden">
                                <div className="p-4 bg-gray-700 border-b border-gray-600">
                                    <h4 className="text-white font-semibold flex items-center space-x-2">
                                        <span>Original</span>
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">BEFORE</span>
                                    </h4>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="max-h-full max-w-full rounded-lg shadow-xl border border-gray-600"
                                        style={{
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: 'center'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Enhanced */}
                            <div className="flex flex-col bg-gray-800 rounded-xl border border-purple-500/50 overflow-hidden">
                                <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-500">
                                    <h4 className="text-white font-semibold flex items-center space-x-2">
                                        <Sparkles size={16} />
                                        <span>Enhanced</span>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">AFTER</span>
                                    </h4>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img
                                        src={processedPreviewUrl}
                                        alt="Enhanced"
                                        className="max-h-full max-w-full rounded-lg shadow-xl border border-purple-500/50"
                                        style={{
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: 'center'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : previewUrl ? (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt={file.file_name}
                                className="rounded-2xl shadow-2xl border border-gray-600 max-h-[80vh] max-w-[90vw]"
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'center'
                                }}
                                onError={() => setPreviewUrl(null)}
                            />

                            {/* Processing Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                    <div className="bg-gray-800/90 rounded-xl p-6 text-center border border-gray-600">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Sparkles className="text-white" size={32} />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">Enhancing Image</h4>
                                        <p className="text-gray-300">AI is working on your image...</p>
                                    </div>
                                </div>
                            )}

                            {/*/!* Success Overlay *!/*/}
                            {/*{processedPreviewUrl && !showComparison && (*/}
                            {/*    <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg flex items-center space-x-2">*/}
                            {/*        <Sparkles size={16} />*/}
                            {/*        <span>Enhanced!</span>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 text-center border border-gray-600 shadow-2xl max-w-md">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ImageIcon className="text-white" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Preview Unavailable</h3>
                            <p className="text-gray-400 mb-6">Unable to load preview for this file</p>
                            <button
                                onClick={() => loadPreview(file.file_path)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Retry Loading
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilePreview;