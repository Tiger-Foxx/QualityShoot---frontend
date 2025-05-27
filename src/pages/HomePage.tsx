import React, { useState, useEffect } from 'react';
import {
    Cpu, HardDrive, CheckCircle, AlertCircle, Wifi, WifiOff,
    Sparkles, Zap, ChevronRight, TrendingUp, Clock, Star,
    Play, Image, Video, Download, Settings, Users
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    description: string;
    color: string;
    trend?: string;
    isLoading?: boolean;
}


interface ModelCardProps {
    name: string;
    description: string;
    scale: string;
    isAvailable: boolean;
    performance: 'Fast' | 'Medium' | 'Slow';
}

const ModelCard: React.FC<ModelCardProps> = ({
                                                 name, description, scale, isAvailable, performance
                                             }) => {
    const performanceColors = {
        Fast: 'text-green-400 bg-green-400/10',
        Medium: 'text-yellow-400 bg-yellow-400/10',
        Slow: 'text-orange-400 bg-orange-400/10'
    };

    return (
        <div className={`relative bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${
            isAvailable
                ? 'border-green-500/30 hover:border-green-400/50'
                : 'border-gray-700/50 opacity-60'
        }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                        isAvailable ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`} />
                    <h4 className="text-white font-semibold text-sm">{name}</h4>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${performanceColors[performance]}`}>
                    {performance}
                </div>
            </div>

            <p className="text-gray-400 text-xs mb-3 leading-relaxed">{description}</p>

            <div className="flex items-center justify-between">
                <span className="text-blue-400 font-mono text-sm bg-blue-400/10 px-2 py-1 rounded">
                    {scale}
                </span>
                <span className={`text-xs font-medium ${
                    isAvailable ? 'text-green-400' : 'text-gray-500'
                }`}>
                    {isAvailable ? 'Ready' : 'Unavailable'}
                </span>
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [serverConnected, setServerConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadData();
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const health = await apiService.healthCheck();
            setSystemHealth(health);
            setServerConnected(true);
        } catch (error) {
            setServerConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const aiModels = [
        { name: 'RealESR_Gx4', description: 'Best for realistic photos and detailed images', scale: '4x', available: true, performance: 'Medium' as const },
        { name: 'RealESR_Animex4', description: 'Specialized for anime and illustrations', scale: '4x', available: true, performance: 'Medium' as const },
        { name: 'BSRGANx4', description: 'Balanced quality for various content types', scale: '4x', available: true, performance: 'Fast' as const },
        { name: 'RealESRGANx4', description: 'Classic ESRGAN model with good results', scale: '4x', available: false, performance: 'Slow' as const },
    ];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-white text-xl font-bold">Initializing QualityShoot</h3>
                        <p className="text-gray-400 animate-pulse">Connecting to AI enhancement engine...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
            <div className="min-h-full p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Hero Section */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                            {/* Welcome Content */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Sparkles className="text-white" size={32} />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                                Welcome back !
                                            </h1>
                                            <p className="text-gray-400 text-lg">Ready to enhance your content with AI</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                                            serverConnected
                                                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                        }`}>
                                            {serverConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
                                            <span className="font-medium">
                                                {serverConnected ? 'System Online' : 'Connection Failed'}
                                            </span>
                                        </div>

                                        <div className="text-gray-400 text-sm flex items-center space-x-2">
                                            <Clock size={16} />
                                            <span>{currentTime.toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg">
                                        <Play size={18} />
                                        <span>Start Enhancing</span>
                                    </button>
                                    <button className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all border border-gray-600/50">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>
                                </div>
                            </div>

                            {/* Before/After Preview */}
                            <div className="relative">
                                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-white font-semibold flex items-center space-x-2">
                                            <Star className="text-yellow-400" size={18} />
                                            <span>AI Enhancement Preview</span>
                                        </h3>
                                        <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                                            4x Upscaling
                                        </div>
                                    </div>

                                    <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-600/50">
                                        <img
                                            src="/src/assets/beforeafter.png"
                                            alt="Before/After comparison"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                                        {/* Before/After Labels */}
                                        <div className="absolute top-4 left-4 bg-red-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Before
                                        </div>
                                        <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            After
                                        </div>

                                        {/* Enhancement Badge */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 backdrop-blur-sm">
                                            <Sparkles size={16} />
                                            <span>Enhanced by AI</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* AI Models Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

                        {/* Models Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <Cpu className="text-white" size={18} />
                                    </div>
                                    <span>AI Enhancement Models</span>
                                </h2>
                                <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                                    {aiModels.filter(m => m.available).length} of {aiModels.length} ready
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiModels.map((model) => (
                                    <ModelCard
                                        key={model.name}
                                        name={model.name}
                                        description={model.description}
                                        scale={model.scale}
                                        isAvailable={model.available}
                                        performance={model.performance}
                                    />
                                ))}
                            </div>
                        </div>


                    </div>

                </div>
            </div>
        </div>
    );
};

export default HomePage;