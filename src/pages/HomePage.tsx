import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '../services/apiService';

const HomePage: React.FC = () => {
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [serverConnected, setServerConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
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

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Connexion au backend...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Bienvenue, theTigerFox ! 👋
                            </h1>
                            <p className="text-gray-400">
                                Votre système d'upscaling IA est {serverConnected ? 'opérationnel' : 'déconnecté'}
                            </p>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                            serverConnected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                            {serverConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
                            <span>{serverConnected ? 'Connecté' : 'Déconnecté'}</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <Cpu className="text-blue-400" size={24} />
                            <div>
                                <p className="text-white font-medium">Modèles IA</p>
                                <p className="text-gray-400">{systemHealth?.models_count || 0} disponibles</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <HardDrive className="text-green-400" size={24} />
                            <div>
                                <p className="text-white font-medium">Stockage</p>
                                <p className="text-gray-400">Disponible</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            {serverConnected ? (
                                <CheckCircle className="text-green-400" size={24} />
                            ) : (
                                <AlertCircle className="text-red-400" size={24} />
                            )}
                            <div>
                                <p className="text-white font-medium">Status API</p>
                                <p className="text-gray-400">{systemHealth?.status || 'Erreur'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modèles disponibles */}
                {systemHealth?.available_models && (
                    <div className="bg-gray-900 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Modèles IA Disponibles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {systemHealth.available_models.map((model: string) => (
                                <div key={model} className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-white">{model}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;