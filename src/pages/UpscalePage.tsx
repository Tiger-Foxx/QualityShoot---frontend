import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    X,
    Image,
    Video,
    Settings,
    Play,
    Pause,
    RotateCcw,
    Download,
    Eye,
    AlertCircle,
    CheckCircle,
    Loader,
    FileText,
    Trash2, ChevronRight
} from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { useUpscale } from '../hooks/useUpscale';
import { formatFileSize } from '../utils/fileUtils';
import { AIModel, BlendingLevel, VideoCodec, GPU } from '../models';
import type { UpscaleRequest } from '../models';

const UpscalePage: React.FC = () => {
    const {
        selectedFiles,
        isLoading: filesLoading,
        error: filesError,
        selectFiles,
        removeFile,
        clearFiles,
        getTotalSize,
        getFilesByType
    } = useFiles();

    const {
        isProcessing,
        currentProcess,
        error: processError,
        startUpscaling,
        cancelUpscaling,
        resetProcess,
        progress
    } = useUpscale();

    // État pour les paramètres
    const [settings, setSettings] = useState<Partial<UpscaleRequest>>({
        ai_model: AIModel.REALESR_GX4,
        input_resize_factor: 1.0,
        output_resize_factor: 1.0,
        gpu: GPU.AUTO,
        vram_limit: 4.0,
        blending: BlendingLevel.OFF,
        multithreading: 1,
        keep_frames: false,
        image_extension: '.png',
        video_extension: '.mp4',
        video_codec: VideoCodec.X264
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleStartUpscaling = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        const request: UpscaleRequest = {
            file_paths: selectedFiles.map(f => f.file_path),
            ai_model: settings.ai_model!,
            input_resize_factor: settings.input_resize_factor!,
            output_resize_factor: settings.output_resize_factor!,
            gpu: settings.gpu!,
            vram_limit: settings.vram_limit!,
            blending: settings.blending!,
            multithreading: settings.multithreading!,
            keep_frames: settings.keep_frames!,
            image_extension: settings.image_extension!,
            video_extension: settings.video_extension!,
            video_codec: settings.video_codec!
        };

        await startUpscaling(request);
    }, [selectedFiles, settings, startUpscaling]);

    const { images, videos } = getFilesByType();

    return (
        <div className="h-full flex overflow-hidden">
            {/* Panneau de fichiers */}
            <div className="w-1/3 border-r border-gray-800 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                        <Upload className="text-sky-400" size={28} />
                        <span>Fichiers</span>
                    </h2>
                    <p className="text-gray-400">Sélectionnez vos images et vidéos à améliorer</p>
                </div>

                {/* Zone de drop */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {selectedFiles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 hover:border-sky-500 transition-colors cursor-pointer group"
                            onClick={selectFiles}
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Déposez vos fichiers ici</h3>
                            <p className="text-gray-400 text-center mb-4">
                                Ou cliquez pour sélectionner des images et vidéos
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Image size={16} />
                                    <span>Images</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Video size={16} />
                                    <span>Vidéos</span>
                                </div>
                            </div>
                            {filesLoading && (
                                <div className="mt-4 flex items-center space-x-2 text-sky-400">
                                    <Loader className="animate-spin" size={16} />
                                    <span>Chargement...</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {/* Statistiques */}
                            <div className="glass-effect rounded-lg p-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-white">{selectedFiles.length}</div>
                                        <div className="text-xs text-gray-400">Fichiers</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">{images.length}</div>
                                        <div className="text-xs text-gray-400">Images</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-400">{videos.length}</div>
                                        <div className="text-xs text-gray-400">Vidéos</div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                                    <div className="text-sm text-gray-400">
                                        Taille totale: <span className="text-white font-medium">{formatFileSize(getTotalSize())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={selectFiles}
                                    className="flex-1 btn-ghost text-sm py-2"
                                    disabled={filesLoading}
                                >
                                    <Upload size={16} className="mr-1" />
                                    Ajouter
                                </button>
                                <button
                                    onClick={clearFiles}
                                    className="flex-1 btn-ghost text-sm py-2 text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={16} className="mr-1" />
                                    Vider
                                </button>
                            </div>

                            {/* Liste des fichiers */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                <AnimatePresence>
                                    {selectedFiles.map((file, index) => (
                                        <motion.div
                                            key={file.file_path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="list-item bg-gray-800 rounded-lg p-3 group hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    file.is_video ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {file.is_video ? <Video size={16} /> : <Image size={16} />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white truncate">{file.file_name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatFileSize(file.file_size)}
                                                        {file.resolution && (
                                                            <span className="ml-2">{file.resolution[0]}×{file.resolution[1]}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => removeFile(file.file_path)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {filesError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-400"
                        >
                            <AlertCircle size={16} />
                            <span className="text-sm">{filesError}</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Panneau de contrôle */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                        <Settings className="text-purple-400" size={28} />
                        <span>Configuration</span>
                    </h2>
                    <p className="text-gray-400">Ajustez les paramètres d'upscaling pour des résultats optimaux</p>
                </div>

                {/* Paramètres */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Modèle IA */}
                    <div className="card-modern">
                        <h3 className="text-lg font-semibold text-white mb-4">Modèle d'Intelligence Artificielle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.values(AIModel).map((model) => (
                                <button
                                    key={model}
                                    onClick={() => setSettings(prev => ({ ...prev, ai_model: model }))}
                                    className={`p-4 rounded-lg border transition-all text-left ${
                                        settings.ai_model === model
                                            ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="font-medium">{model}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {model.includes('Anime') ? 'Optimisé pour l\'animation' : 'Usage général'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Facteurs de redimensionnement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card-modern">
                            <h4 className="text-lg font-semibold text-white mb-4">Redimensionnement d'entrée</h4>
                            <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.1"
                                value={settings.input_resize_factor}
                                onChange={(e) => setSettings(prev => ({ ...prev, input_resize_factor: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-center mt-2 text-sky-400 font-medium">
                                {settings.input_resize_factor}x
                            </div>
                        </div>

                        <div className="card-modern">
                            <h4 className="text-lg font-semibold text-white mb-4">Redimensionnement de sortie</h4>
                            <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.1"
                                value={settings.output_resize_factor}
                                onChange={(e) => setSettings(prev => ({ ...prev, output_resize_factor: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-center mt-2 text-sky-400 font-medium">
                                {settings.output_resize_factor}x
                            </div>
                        </div>
                    </div>

                    {/* Paramètres avancés */}
                    <motion.div
                        initial={false}
                        animate={{ height: showAdvanced ? 'auto' : 'fit-content' }}
                        className="space-y-4"
                    >
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Settings size={16} />
                            <span>Paramètres avancés</span>
                            <motion.div
                                animate={{ rotate: showAdvanced ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight size={16} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Blending */}
                                    <div className="card-modern">
                                        <h4 className="text-lg font-semibold text-white mb-4">Niveau de mélange</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.values(BlendingLevel).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setSettings(prev => ({ ...prev, blending: level }))}
                                                    className={`p-3 rounded-lg border transition-all ${
                                                        settings.blending === level
                                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                            : 'bg-gray-800 border-gray-700 text-gray-300'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* GPU et VRAM */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="card-modern">
                                            <h4 className="text-lg font-semibold text-white mb-4">GPU</h4>
                                            <select
                                                value={settings.gpu}
                                                onChange={(e) => setSettings(prev => ({ ...prev, gpu: e.target.value as GPU }))}
                                                className="input-modern"
                                            >
                                                {Object.values(GPU).map((gpu) => (
                                                    <option key={gpu} value={gpu}>{gpu}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="card-modern">
                                            <h4 className="text-lg font-semibold text-white mb-4">Limite VRAM ({settings.vram_limit} GB)</h4>
                                            <input
                                                type="range"
                                                min="1"
                                                max="24"
                                                step="0.5"
                                                value={settings.vram_limit}
                                                onChange={(e) => setSettings(prev => ({ ...prev, vram_limit: parseFloat(e.target.value) }))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Bouton de démarrage */}
                    <div className="pt-6 border-t border-gray-800">
                        {!isProcessing ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartUpscaling}
                                disabled={selectedFiles.length === 0}
                                className="w-full btn-primary h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play size={24} className="mr-2" />
                                Démarrer l'Upscaling ({selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''})
                            </motion.button>
                        ) : (
                            <div className="space-y-4">
                                <div className="card-modern">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Loader className="animate-spin text-sky-400" size={20} />
                                            <span className="text-white font-medium">Traitement en cours...</span>
                                        </div>
                                        <button
                                            onClick={cancelUpscaling}
                                            className="btn-ghost text-red-400 hover:text-red-300 px-4 py-2"
                                        >
                                            <Pause size={16} className="mr-1" />
                                            Annuler
                                        </button>
                                    </div>

                                    <div className="progress-bar mb-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="progress-fill"
                                        />
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{Math.round(progress)}% terminé</span>
                                        {currentProcess?.current_file && (
                                            <span>Fichier: {currentProcess.current_file}</span>
                                        )}
                                    </div>

                                    {currentProcess?.current_step && (
                                        <div className="mt-2 text-sm text-sky-400">
                                            {currentProcess.current_step}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {processError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-400"
                        >
                            <AlertCircle size={20} />
                            <div>
                                <div className="font-medium">Erreur de traitement</div>
                                <div className="text-sm">{processError}</div>
                            </div>
                        </motion.div>
                    )}

                    {currentProcess?.status === 'completed' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2 text-green-400"
                        >
                            <CheckCircle size={20} />
                            <div>
                                <div className="font-medium">Traitement terminé !</div>
                                <div className="text-sm">
                                    {currentProcess.completed_files.length} fichier(s) traité(s) avec succès
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpscalePage;