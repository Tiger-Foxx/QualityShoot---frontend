import React, { useState } from 'react';
import { Sliders, Cpu, Settings, ChevronDown, ChevronUp, FolderOpen, HardDrive } from 'lucide-react';
import { AIModel } from '../models';
import { electronService } from '../services/electronService';
import type { UpscaleRequest } from '../models';

interface EnhancementSettingsProps {
    onSettingsChange: (settings: Partial<UpscaleRequest>) => void;
    isProcessing: boolean;
    selectedFilesCount: number;
}

const QUALITY_PRESETS = {
    fast: {
        name: "Fast Processing",
        description: "Quick results, standard quality",
        icon: "⚡",
        model: AIModel.REALESR_GX4,
        settings: { input: 1.0, output: 1.0, vram: 2, scale: "4x" }
    },
    balanced: {
        name: "Balanced Quality",
        description: "Best balance of speed and quality",
        icon: "⚖️",
        model: AIModel.REALESR_GX4,
        settings: { input: 1.0, output: 1.2, vram: 4, scale: "4x → 4.8x" }
    },
    high: {
        name: "High Quality",
        description: "Maximum quality, slower processing",
        icon: "💎",
        model: AIModel.REALESR_GX4,
        settings: { input: 1.0, output: 1.5, vram: 6, scale: "4x → 6x" }
    },
    anime: {
        name: "Anime & Illustrations",
        description: "Optimized for drawn content",
        icon: "🎨",
        model: AIModel.REALESR_ANIMEX4,
        settings: { input: 1.0, output: 1.0, vram: 4, scale: "4x" }
    }
};

const AI_MODELS = {
    [AIModel.REALESR_GX4]: {
        name: "RealESRGAN x4",
        description: "Best for photos and realistic images",
        scale: 4,
        quality: "High",
        speed: "Medium"
    },
    [AIModel.REALESR_ANIMEX4]: {
        name: "RealESRGAN Anime x4",
        description: "Specialized for anime and illustrations",
        scale: 4,
        quality: "High",
        speed: "Medium"
    },
    [AIModel.BSRGANX4]: {
        name: "BSRGAN x4",
        description: "Good balance for various content types",
        scale: 4,
        quality: "Medium",
        speed: "Fast"
    }
};

const EnhancementSettings: React.FC<EnhancementSettingsProps> = ({
                                                                     onSettingsChange,
                                                                     isProcessing,
                                                                     selectedFilesCount
                                                                 }) => {
    const [selectedPreset, setSelectedPreset] = useState<keyof typeof QUALITY_PRESETS>('balanced');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customOutputPath, setCustomOutputPath] = useState<string>('');
    const [customSettings, setCustomSettings] = useState({
        ai_model: AIModel.REALESR_GX4,
        input_resize_factor: 1.0,
        output_resize_factor: 1.2,
        vram_limit: 4.0,
        multithreading: 1,
        output_path: undefined as string | undefined
    });

    const handlePresetChange = (preset: keyof typeof QUALITY_PRESETS) => {
        setSelectedPreset(preset);
        const presetData = QUALITY_PRESETS[preset];

        const settings = {
            ai_model: presetData.model,
            input_resize_factor: presetData.settings.input,
            output_resize_factor: presetData.settings.output,
            vram_limit: presetData.settings.vram,
            gpu: 'Auto' as any,
            blending: 'OFF' as any,
            multithreading: 1,
            keep_frames: false,
            image_extension: '.png',
            video_extension: '.mp4',
            video_codec: 'x264' as any,
            output_path: customOutputPath || undefined
        };

        setCustomSettings(prev => ({ ...prev, ...settings }));
        onSettingsChange(settings);
    };

    const handleCustomChange = (key: string, value: any) => {
        const newSettings = { ...customSettings, [key]: value };
        setCustomSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleSelectOutputPath = async () => {
        try {
            const selectedPath = await electronService.selectFolder();
            if (selectedPath) {
                setCustomOutputPath(selectedPath);
                handleCustomChange('output_path', selectedPath);
            }
        } catch (error) {
            console.error('Erreur sélection dossier:', error);
        }
    };

    const clearOutputPath = () => {
        setCustomOutputPath('');
        handleCustomChange('output_path', undefined);
    };

    const calculateFinalScale = () => {
        const modelInfo = AI_MODELS[customSettings.ai_model];
        if (!modelInfo) return "4x";

        const baseScale = modelInfo.scale;
        const finalScale = baseScale * customSettings.output_resize_factor;
        return `${finalScale.toFixed(1)}x`;
    };

    const getOutputPathDisplay = () => {
        if (!customOutputPath) return 'Default (same as source)';
        return customOutputPath.length > 25
            ? `...${customOutputPath.slice(-25)}`
            : customOutputPath;
    };

    return (
        <div className="w-80 bg-[#2d2d2d] border-l border-gray-600 flex flex-col">
            {/* Settings Header */}
            <div className="p-4 border-b border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Sliders className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">Enhancement</h2>
                        <p className="text-gray-300 text-sm">Configure AI settings</p>
                    </div>
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                {/* Quick Presets */}
                <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                        <span>Quality Presets</span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">RECOMMENDED</span>
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key as keyof typeof QUALITY_PRESETS)}
                                disabled={isProcessing}
                                className={`w-full p-4 rounded-xl text-left transition-all border-2 group ${
                                    selectedPreset === key
                                        ? 'border-blue-500 bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-white shadow-lg'
                                        : 'border-gray-600 bg-[#383838] text-gray-300 hover:bg-[#404040] hover:border-gray-500'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{preset.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-lg">{preset.name}</div>
                                        <div className="text-sm opacity-80 mt-1">{preset.description}</div>
                                        <div className="text-xs text-blue-400 font-mono bg-blue-900/30 px-2 py-1 rounded mt-2 inline-block">
                                            {preset.settings.scale}
                                        </div>
                                    </div>
                                    {selectedPreset === key && (
                                        <div className="w-3 h-3 bg-blue-400 rounded-full" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Output Path Selection */}
                <div className="bg-[#383838] rounded-xl p-4 border border-gray-600">
                    <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                        <HardDrive size={16} />
                        <span>Output Location</span>
                    </h4>

                    <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                            <div className="text-xs text-gray-400 mb-1">Current Output:</div>
                            <div className="text-white text-sm font-mono break-all">
                                {getOutputPathDisplay()}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleSelectOutputPath}
                                disabled={isProcessing}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium"
                            >
                                <FolderOpen size={16} />
                                <span>Choose Folder</span>
                            </button>

                            {customOutputPath && (
                                <button
                                    onClick={clearOutputPath}
                                    disabled={isProcessing}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                                    title="Use Default Location"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-gray-400">
                            💡 Leave empty to save enhanced files next to originals
                        </div>
                    </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    disabled={isProcessing}
                    className="w-full bg-[#383838] hover:bg-[#404040] disabled:opacity-50 border border-gray-600 rounded-xl p-4 flex items-center justify-between text-white transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <Settings size={18} />
                        <span className="font-semibold">Advanced Settings</span>
                    </div>
                    {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Advanced Settings */}
                {showAdvanced && (
                    <div className="space-y-4 bg-[#383838] rounded-xl p-4 border border-gray-600">
                        {/* AI Model Selection */}
                        <div>
                            <label className="text-white text-sm font-semibold mb-3 block">AI Model</label>
                            <select
                                value={customSettings.ai_model}
                                onChange={(e) => handleCustomChange('ai_model', e.target.value)}
                                disabled={isProcessing}
                                className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {Object.entries(AI_MODELS).map(([key, model]) => (
                                    <option key={key} value={key}>
                                        {model.name} - {model.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Scale Factor */}
                        <div>
                            <label className="text-white text-sm font-semibold mb-2 block">
                                Final Scale: <span className="text-green-400 font-mono">{calculateFinalScale()}</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={customSettings.output_resize_factor}
                                onChange={(e) => handleCustomChange('output_resize_factor', parseFloat(e.target.value))}
                                disabled={isProcessing}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>0.5x smaller</span>
                                <span>2x larger</span>
                            </div>
                        </div>

                        {/* Input Resize */}
                        <div>
                            <label className="text-white text-sm font-semibold mb-2 block">
                                Input Resize: <span className="text-blue-400 font-mono">{(customSettings.input_resize_factor * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.1"
                                value={customSettings.input_resize_factor}
                                onChange={(e) => handleCustomChange('input_resize_factor', parseFloat(e.target.value))}
                                disabled={isProcessing}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-xs text-gray-400 mt-2">
                                💡 Lower = faster processing, higher = better quality
                            </div>
                        </div>

                        {/* VRAM Limit */}
                        <div>
                            <label className="text-white text-sm font-semibold mb-2 block">
                                GPU Memory: <span className="text-purple-400 font-mono">{customSettings.vram_limit}GB</span>
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="12"
                                step="1"
                                value={customSettings.vram_limit}
                                onChange={(e) => handleCustomChange('vram_limit', parseInt(e.target.value))}
                                disabled={isProcessing}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-xs text-gray-400 mt-2">
                                🎯 Adjust based on your GPU's available memory
                            </div>
                        </div>
                    </div>
                )}

                {/* System Status */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-600">
                    <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                        <Cpu size={18} />
                        <span>System Status</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">{selectedFilesCount}</div>
                            <div className="text-gray-400">Selected Files</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">{calculateFinalScale()}</div>
                            <div className="text-gray-400">Final Scale</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-400">{customSettings.vram_limit}GB</div>
                            <div className="text-gray-400">GPU Memory</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                            <div className="text-xs font-bold text-blue-400 truncate">
                                {AI_MODELS[customSettings.ai_model]?.name?.replace('RealESRGAN ', '') || 'Unknown'}
                            </div>
                            <div className="text-gray-400">AI Model</div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">System Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancementSettings;