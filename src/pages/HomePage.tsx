import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Upload,
    Image,
    Video,
    TrendingUp,
    Clock,
    HardDrive,
    Cpu,
    ChevronRight,
    Sparkles,
    Play,
    Pause
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface Stats {
    totalProcessed: number;
    totalSize: string;
    averageTime: string;
    successRate: number;
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    color: string;
}

const HomePage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalProcessed: 0,
        totalSize: '0 GB',
        averageTime: '0s',
        successRate: 0
    });
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger les infos système
                const health = await apiService.healthCheck();
                setSystemInfo(health);

                // Stats simulées (à remplacer par de vraies données)
                setStats({
                    totalProcessed: 1247,
                    totalSize: '34.7 GB',
                    averageTime: '2m 34s',
                    successRate: 98.5
                });
            } catch (error) {
                console.error('Erreur chargement données:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const quickActions: QuickAction[] = [
        {
            title: 'Upscaler des Images',
            description: 'Améliorez la qualité de vos photos instantanément',
            icon: <Image size={24} />,
            action: () => {/* Navigation vers upscale */},
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Upscaler des Vidéos',
            description: 'Donnez une nouvelle vie à vos vidéos',
            icon: <Video size={24} />,
            action: () => {/* Navigation vers upscale */},
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Traitement par Lot',
            description: 'Traitez plusieurs fichiers simultanément',
            icon: <Upload size={24} />,
            action: () => {/* Navigation vers upscale */},
            color: 'from-green-500 to-emerald-500'
        }
    ];

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-shimmer w-96 h-64 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-8">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-500/20 to-purple-500/20 p-8 border border-sky-500/30"
            >
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <Sparkles className="text-yellow-400" size={32} />
                        <h1 className="text-4xl font-bold text-gradient">
                            Bienvenue, {window.navigator?.userAgent?.includes('Electron') ? 'theTigerFox' : 'Utilisateur'} ! 👋
                        </h1>
                    </div>
                    <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                        Transformez vos images et vidéos avec la puissance de l'Intelligence Artificielle.
                        Des résultats professionnels en quelques clics.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Zap size={20} />
                        <span>Commencer l'Upscaling</span>
                        <ChevronRight size={16} />
                    </motion.button>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full blur-xl"></div>
                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-xl"></div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Fichiers Traités', value: stats.totalProcessed, icon: TrendingUp, color: 'text-green-400' },
                    { label: 'Données Traitées', value: stats.totalSize, icon: HardDrive, color: 'text-blue-400' },
                    { label: 'Temps Moyen', value: stats.averageTime, icon: Clock, color: 'text-yellow-400' },
                    { label: 'Taux de Réussite', value: `${stats.successRate}%`, icon: Cpu, color: 'text-purple-400' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card-modern group hover:scale-105 transition-transform duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`${stat.color} group-hover:scale-110 transition-transform`} size={24} />
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                                className="progress-fill"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Zap className="text-sky-400" size={28} />
                    <span>Actions Rapides</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            onClick={action.action}
                            className="group text-left p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl"
                        >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{action.description}</p>
                            <ChevronRight className="mt-4 text-gray-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" size={20} />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Modèles IA Disponibles */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-modern"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <Cpu className="text-purple-400" size={24} />
                        <span>Modèles IA</span>
                    </h3>

                    {systemInfo?.available_models ? (
                        <div className="space-y-3">
                            {systemInfo.available_models.slice(0, 4).map((model: string, index: number) => (
                                <div key={model} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="status-dot completed"></div>
                                        <span className="text-gray-300">{model}</span>
                                    </div>
                                    <span className="text-xs text-green-400">Actif</span>
                                </div>
                            ))}
                            <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  {systemInfo.models_count} modèles disponibles
                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-shimmer h-32 rounded-lg"></div>
                    )}
                </motion.div>

                {/* Activité Récente */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-modern"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <Clock className="text-yellow-400" size={24} />
                        <span>Activité Récente</span>
                    </h3>

                    <div className="space-y-3">
                        {[
                            { file: 'photo_vacation.jpg', status: 'completed', time: 'Il y a 2h' },
                            { file: 'video_wedding.mp4', status: 'completed', time: 'Il y a 5h' },
                            { file: 'landscape_4k.png', status: 'processing', time: 'En cours...' },
                            { file: 'family_photo.jpg', status: 'completed', time: 'Hier' }
                        ].map((activity, index) => (
                            <motion.div
                                key={activity.file}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`status-dot ${activity.status}`}></div>
                                    <div>
                                        <div className="text-gray-300 text-sm">{activity.file}</div>
                                        <div className="text-xs text-gray-500">{activity.time}</div>
                                    </div>
                                </div>
                                {activity.status === 'processing' && (
                                    <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomePage;