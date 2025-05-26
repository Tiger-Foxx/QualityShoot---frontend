import React from 'react';
import { Square, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { ProcessStatusResponse } from '../models';

interface ProcessingStatusProps {
    progress: number;
    currentProcess: ProcessStatusResponse | null;
    onCancel: () => Promise<void>;
    onReset: () => void;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
                                                               progress,
                                                               currentProcess,
                                                               onCancel,
                                                               onReset
                                                           }) => {
    const getStatusColor = () => {
        if (!currentProcess) return 'blue';

        switch (currentProcess.status) {
            case 'completed': return 'green';
            case 'error': return 'red';
            case 'cancelled': return 'yellow';
            default: return 'blue';
        }
    };

    const getStatusIcon = () => {
        if (!currentProcess) return <Clock size={20} />;

        switch (currentProcess.status) {
            case 'completed': return <CheckCircle size={20} className="text-green-400" />;
            case 'error': return <XCircle size={20} className="text-red-400" />;
            case 'cancelled': return <Square size={20} className="text-yellow-400" />;
            default: return <Clock size={20} className="text-blue-400" />;
        }
    };

    if (!currentProcess) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="bg-[#2d2d2d] border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {getStatusIcon()}
                        <h3 className="text-white font-semibold">Processing Status</h3>
                    </div>
                    <span className={`text-${getStatusColor()}-400 font-bold text-lg`}>
            {Math.round(progress)}%
          </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className={`bg-gradient-to-r from-${getStatusColor()}-500 to-${getStatusColor()}-600 h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Current Info */}
                {currentProcess.current_file && (
                    <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Current File:</div>
                        <div className="text-white font-medium truncate">
                            📄 {currentProcess.current_file}
                        </div>
                    </div>
                )}

                {currentProcess.current_step && (
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">Current Step:</div>
                        <div className="text-green-400 text-sm">
                            ⚙️ {currentProcess.current_step}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div className="bg-[#383838] rounded-lg p-2">
                        <div className="text-green-400 font-bold">{currentProcess.completed_files.length}</div>
                        <div className="text-xs text-gray-400">Completed</div>
                    </div>
                    <div className="bg-[#383838] rounded-lg p-2">
                        <div className="text-red-400 font-bold">{currentProcess.failed_files.length}</div>
                        <div className="text-xs text-gray-400">Failed</div>
                    </div>
                    <div className="bg-[#383838] rounded-lg p-2">
                        <div className="text-blue-400 font-bold">
                            {(currentProcess.completed_files.length + currentProcess.failed_files.length)}
                        </div>
                        <div className="text-xs text-gray-400">Processed</div>
                    </div>
                </div>

                {/* Time Estimate */}
                {currentProcess.estimated_time_remaining && (
                    <div className="mb-4 text-center">
                        <div className="text-sm text-gray-400">Estimated Time Remaining:</div>
                        <div className="text-white font-medium">
                            {Math.round(currentProcess.estimated_time_remaining / 60)} minutes
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                    {currentProcess.status === 'processing' ? (
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Square size={16} />
                            <span>Cancel Process</span>
                        </button>
                    ) : (
                        <button
                            onClick={onReset}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <RotateCcw size={16} />
                            <span>Start New Process</span>
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {currentProcess.error_message && (
                    <div className="mt-4 bg-red-900/50 border border-red-600 rounded-lg p-3">
                        <div className="text-red-300 text-sm">
                            <strong>Error:</strong> {currentProcess.error_message}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessingStatus;