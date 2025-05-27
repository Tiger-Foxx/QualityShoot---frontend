import React from 'react';
import { FolderOpen, Layers, Trash2, Plus, X, ImageIcon, Video, HardDrive, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { FileInfo } from '../models';

interface FileManagerProps {
    selectedFiles: FileInfo[];
    isLoading: boolean;
    error: string | null;
    onSelectFiles: () => Promise<void>;
    onAddFiles: () => Promise<void>;
    onRemoveFile: (filePath: string) => void;
    onClearFiles: () => void;
    onFilePreview: (file: FileInfo | null) => void;
    previewFile: FileInfo | null;
    totalSize: number;
    filesByType: { images: FileInfo[], videos: FileInfo[] };
}

const FileManager: React.FC<FileManagerProps> = ({
                                                     selectedFiles,
                                                     isLoading,
                                                     error,
                                                     onSelectFiles,
                                                     onAddFiles,
                                                     onRemoveFile,
                                                     onClearFiles,
                                                     onFilePreview,
                                                     previewFile,
                                                     totalSize,
                                                     filesByType
                                                 }) => {

    const getFilePreview = (file: FileInfo) => {
        if (file.is_video) {
            return (
                <div className="w-full h-full bg-gray-800 rounded flex flex-col items-center justify-center text-gray-400">
                    <Video size={16} />
                </div>
            );
        }
        return (
            <div className="w-full h-full bg-gray-800 rounded flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={16} />
            </div>
        );
    };

    const getEstimatedProcessingTime = () => {
        const imageCount = filesByType.images.length;
        const videoCount = filesByType.videos.length;
        // Estimation: 30s par image, 5min par vidéo
        const estimatedSeconds = (imageCount * 30) + (videoCount * 300);
        return apiService.formatDuration(estimatedSeconds);
    };

    return (
        <div className="w-80 bg-[#2d2d2d] border-r border-gray-600 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-600">
                <div className="flex items-center space-x-3 mb-4">
                    <Layers className="text-blue-400" size={20} />
                    <h2 className="text-white font-semibold">Files</h2>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {selectedFiles.length}
          </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={onSelectFiles}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium text-sm"
                    >
                        <FolderOpen size={14} />
                        <span>{isLoading ? 'Loading...' : 'Select'}</span>
                    </button>

                    <button
                        onClick={onAddFiles}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2.5 rounded-lg flex items-center justify-center transition-colors"
                        title="Add More Files"
                    >
                        <Plus size={14} />
                    </button>
                </div>

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
                    <div className="space-y-4">
                        {/* Enhanced Stats */}
                        <div className="bg-[#383838] rounded-lg p-4 border border-gray-600 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-[#2d2d2d] rounded-lg p-3">
                                    <div className="text-lg font-bold text-white">{filesByType.images.length}</div>
                                    <div className="text-xs text-green-400 flex items-center justify-center space-x-1">
                                        <ImageIcon size={12} />
                                        <span>Images</span>
                                    </div>
                                </div>
                                <div className="bg-[#2d2d2d] rounded-lg p-3">
                                    <div className="text-lg font-bold text-white">{filesByType.videos.length}</div>
                                    <div className="text-xs text-blue-400 flex items-center justify-center space-x-1">
                                        <Video size={12} />
                                        <span>Videos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <HardDrive size={14} className="text-gray-400" />
                                    <span className="text-gray-400">Size:</span>
                                    <span className="text-white font-medium">
                    {apiService.formatFileSize(totalSize)}
                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="text-gray-400">Est:</span>
                                    <span className="text-white font-medium">
                    {getEstimatedProcessingTime()}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                            <button
                                onClick={onAddFiles}
                                disabled={isLoading}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Add More
                            </button>
                            <button
                                onClick={onClearFiles}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                title="Clear All"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* File List */}
                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={file.file_path}
                                    className={`bg-[#383838] hover:bg-[#404040] rounded-lg p-3 cursor-pointer transition-all group border-2 ${
                                        previewFile?.file_path === file.file_path
                                            ? 'border-blue-500 bg-blue-900/20'
                                            : 'border-transparent'
                                    }`}
                                    onClick={() => onFilePreview(file)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Thumbnail */}
                                        <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded">
                                            {getFilePreview(file)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white text-sm font-medium truncate">
                                                {file.file_name}
                                            </div>
                                            <div className="text-gray-400 text-xs flex items-center space-x-2">
                                                <span>{apiService.formatFileSize(file.file_size)}</span>
                                                {file.resolution && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{file.resolution[0]}×{file.resolution[1]}</span>
                                                    </>
                                                )}
                                                {file.duration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{apiService.formatDuration(file.duration)}</span>
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
                                                onRemoveFile(file.file_path);
                                                if (previewFile?.file_path === file.file_path) {
                                                    const remaining = selectedFiles.filter(f => f.file_path !== file.file_path);
                                                    onFilePreview(remaining.length > 0 ? remaining[0] : null);
                                                }
                                            }}
                                            className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center transition-all"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-300 text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;