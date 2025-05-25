import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Monitor,
    Palette,
    HardDrive,
    Download,
    Bell,
    Shield,
    Zap,
    RotateCcw,
    Save,
    Trash2,
    ExternalLink,
    Info,
    CheckCircle,
    AlertTriangle, X
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { electronService } from '../services/electronService';

interface AppSettings {
    theme: 'dark' | 'light';
    defaultAIModel: string;
    defaultOutputPath: string;
    autoCleanup: boolean;
    notifications: boolean;
    maxConcurrentProcesses: number;
    defaultVramLimit: number;
    keepOriginalFiles: boolean;
    compressionQuality: number;
    autoUpdate: boolean;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>({
        theme: 'dark',
        defaultAIModel: 'RealESR_Gx4',
        defaultOutputPath: '',
        autoCleanup: true,
        notifications: true,
        maxConcurrentProcesses: 2,
        defaultVramLimit: 4.0,
        keepOriginalFiles: true,
        compressionQuality: 95,
        autoUpdate: true
    });

    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        loadSystemInfo();
        loadSettings();
    }, []);

    const loadSystemInfo = async () => {
        try {
            const info = await apiService.healthCheck();
            setSystemInfo(info);
        } catch (error) {
            console.error('Erreur chargement système:', error);
        }
    };

    const loadSettings = () => {
        // Charger depuis localStorage ou API
        const saved = localStorage.getItem('qualityshoot-settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    };

    const saveSettings = async () => {
        setSaveStatus('saving');
        try {
            localStorage.setItem('qualityshoot-settings', JSON.stringify(settings));
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            setSaveStatus('saved');
            setHasChanges(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const resetSettings = () => {
        setSettings({
            theme: 'dark',
            defaultAIModel: 'RealESR_Gx4',
            defaultOutputPath: '',
            autoCleanup: true,
            notifications: true,
            maxConcurrentProcesses: 2,
            defaultVramLimit: 4.0,
            keepOriginalFiles: true,
            compressionQuality: 95,
            autoUpdate: true
        });
        setHasChanges(true);
    };

    const updateSetting = (key: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const selectOutputPath = async () => {
        try {
            const path = await electronService.selectFolder();
            if (path) {
                updateSetting('defaultOutputPath', path);
            }
        } catch (error) {
            console.error('Erreur sélection dossier:', error);
        }
    };

    const cleanupTempFiles = async () => {
        try {
            await apiService.cleanupTempFiles();
            // Show success notification
        } catch (error) {
            console.error('Erreur nettoyage:', error);
        }
    };

    const settingSections = [
        {
            title: 'Apparence',
            icon: <Palette className="text-pink-400" size={24} />,
            settings: [
                {
                    key: 'theme',
                    label: 'Thème',
                    description: 'Choisissez le thème de l\'interface',
                    component: (
                        <select
                            value={settings.theme}
                            onChange={(e) => updateSetting('theme', e.target.value)}
                            className="input-modern w-32"
                        >
                            <option value="dark">Sombre</option>
                            <option value="light">Clair</option>
                        </select>
                    )
                }
            ]
        },
        {
            title: 'Intelligence Artificielle',
            icon: <Zap className="text-yellow-400" size={24} />,
            settings: [
                {
                    key: 'defaultAIModel',
                    label: 'Modèle par défaut',
                    description: 'Modèle IA utilisé par défaut pour l\'upscaling',
                    component: (
                        <select
                            value={settings.defaultAIModel}
                            onChange={(e) => updateSetting('defaultAIModel', e.target.value)}
                            className="input-modern w-48"
                        >
                            {systemInfo?.available_models?.map((model: string) => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    )
                },
                {
                    key: 'defaultVramLimit',
                    label: 'Limite VRAM par défaut',
                    description: `Limite mémoire GPU : ${settings.defaultVramLimit} GB`,
                    component: (
                        <input
                            type="range"
                            min="1"
                            max="24"
                            step="0.5"
                            value={settings.defaultVramLimit}
                            onChange={(e) => updateSetting('defaultVramLimit', parseFloat(e.target.value))}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    )
                },
                {
                    key: 'maxConcurrentProcesses',
                    label: 'Processus simultanés',
                    description: 'Nombre maximum de traitements en parallèle',
                    component: (
                        <input
                            type="number"
                            min="1"
                            max="8"
                            value={settings.maxConcurrentProcesses}
                            onChange={(e) => updateSetting('maxConcurrentProcesses', parseInt(e.target.value))}
                            className="input-modern w-20 text-center"
                        />
                    )
                }
            ]
        },
        {
            title: 'Fichiers et Stockage',
            icon: <HardDrive className="text-blue-400" size={24} />,
            settings: [
                {
                    key: 'defaultOutputPath',
                    label: 'Dossier de sortie',
                    description: settings.defaultOutputPath || 'Même dossier que les fichiers sources',
                    component: (
                        <div className="flex space-x-2">
                            <button
                                onClick={selectOutputPath}
                                className="btn-secondary text-sm px-3 py-1"
                            >
                                <Download size={16} className="mr-1" />
                                Choisir
                            </button>
                            {settings.defaultOutputPath && (
                                <button
                                    onClick={() => updateSetting('defaultOutputPath', '')}
                                    className="btn-ghost text-sm px-3 py-1 text-red-400"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )
                },
                {
                    key: 'keepOriginalFiles',
                    label: 'Conserver les fichiers originaux',
                    description: 'Ne pas supprimer les fichiers source après traitement',
                    component: (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.keepOriginalFiles}
                                onChange={(e) => updateSetting('keepOriginalFiles', e.target.checked)}
                                className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm text-gray-300">Activé</span>
                        </label>
                    )
                },
                {
                    key: 'compressionQuality',
                    label: 'Qualité de compression',
                    description: `Qualité des images de sortie : ${settings.compressionQuality}%`,
                    component: (
                        <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            value={settings.compressionQuality}
                            onChange={(e) => updateSetting('compressionQuality', parseInt(e.target.value))}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    )
                },
                {
                    key: 'autoCleanup',
                    label: 'Nettoyage automatique',
                    description: 'Supprimer automatiquement les fichiers temporaires',
                    component: (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoCleanup}
                                onChange={(e) => updateSetting('autoCleanup', e.target.checked)}
                                className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm text-gray-300">Activé</span>
                        </label>
                    )
                }
            ]
        },
        {
            title: 'Notifications et Mise à jour',
            icon: <Bell className="text-green-400" size={24} />,
            settings: [
                {
                    key: 'notifications',
                    label: 'Notifications',
                    description: 'Recevoir des notifications de fin de traitement',
                    component: (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => updateSetting('notifications', e.target.checked)}
                                className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm text-gray-300">Activé</span>
                        </label>
                    )
                },
                {
                    key: 'autoUpdate',
                    label: 'Mises à jour automatiques',
                    description: 'Installer automatiquement les nouvelles versions',
                    component: (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoUpdate}
                                onChange={(e) => updateSetting('autoUpdate', e.target.checked)}
                                className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm text-gray-300">Activé</span>
                        </label>
                    )
                }
            ]
        }
    ];

    return (
        <div className="h-full overflow-y-auto p-8 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                        <Settings className="text-purple-400" size={32} />
                        <span>Paramètres</span>
                    </h1>
                    <p className="text-gray-400">Configurez QualityShoot selon vos préférences</p>
                </div>

                <div className="flex items-center space-x-3">
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center space-x-2 text-yellow-400"
                        >
                            <AlertTriangle size={16} />
                            <span className="text-sm">Modifications non sauvegardées</span>
                        </motion.div>
                    )}

                    <button
                        onClick={resetSettings}
                        className="btn-ghost flex items-center space-x-2"
                    >
                        <RotateCcw size={16} />
                        <span>Réinitialiser</span>
                    </button>

                    <button
                        onClick={saveSettings}
                        disabled={!hasChanges || saveStatus === 'saving'}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                        {saveStatus === 'saving' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : saveStatus === 'saved' ? (
                            <CheckCircle size={16} />
                        ) : (
                            <Save size={16} />
                        )}
                        <span>
              {saveStatus === 'saving' ? 'Sauvegarde...' :
                  saveStatus === 'saved' ? 'Sauvegardé !' : 'Sauvegarder'}
            </span>
                    </button>
                </div>
            </motion.div>

            {/* Sections de paramètres */}
            <div className="space-y-6">
                {settingSections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.1 }}
                        className="card-modern"
                    >
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                            {section.icon}
                            <span>{section.title}</span>
                        </h2>

                        <div className="space-y-6">
                            {section.settings.map((setting, settingIndex) => (
                                <motion.div
                                    key={setting.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (sectionIndex * 0.1) + (settingIndex * 0.05) }}
                                    className="flex items-center justify-between py-4 border-b border-gray-800 last:border-b-0"
                                >
                                    <div className="flex-1">
                                        <div className="text-white font-medium mb-1">{setting.label}</div>
                                        <div className="text-sm text-gray-400">{setting.description}</div>
                                    </div>
                                    <div className="ml-6">
                                        {setting.component}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Informations système */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card-modern"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                        <Monitor className="text-cyan-400" size={24} />
                        <span>Informations Système</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Version</div>
                            <div className="text-white font-semibold">QualityShoot v1.0.0</div>
                        </div>

                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Modèles IA</div>
                            <div className="text-white font-semibold">
                                {systemInfo?.models_count || 0} disponibles
                            </div>
                        </div>

                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Statut Backend</div>
                            <div className="flex items-center space-x-2">
                                <div className={`status-dot ${systemInfo?.status === 'healthy' ? 'completed' : 'error'}`}></div>
                                <span className="text-white font-semibold">
                  {systemInfo?.status === 'healthy' ? 'Connecté' : 'Déconnecté'}
                </span>
                            </div>
                        </div>

                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Environnement</div>
                            <div className="text-white font-semibold">
                                {electronService.getEnvironment() === 'electron' ? 'Application' : 'Navigateur'}
                            </div>
                        </div>

                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Utilisateur</div>
                            <div className="text-white font-semibold">theTigerFox</div>
                        </div>

                        <div className="glass-effect rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Dernière connexion</div>
                            <div className="text-white font-semibold">25/05/2025 18:37</div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions de maintenance */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card-modern"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                        <Shield className="text-red-400" size={24} />
                        <span>Maintenance</span>
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div>
                                <div className="text-white font-medium">Nettoyer les fichiers temporaires</div>
                                <div className="text-sm text-gray-400">Libère l'espace disque en supprimant les fichiers temporaires</div>
                            </div>
                            <button
                                onClick={cleanupTempFiles}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Trash2 size={16} />
                                <span>Nettoyer</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div>
                                <div className="text-white font-medium">Vérifier les mises à jour</div>
                                <div className="text-sm text-gray-400">Rechercher et installer les dernières mises à jour</div>
                            </div>
                            <button className="btn-secondary flex items-center space-x-2">
                                <ExternalLink size={16} />
                                <span>Vérifier</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div>
                                <div className="text-white font-medium">Journaux de débogage</div>
                                <div className="text-sm text-gray-400">Accéder aux logs pour le dépannage</div>
                            </div>
                            <button className="btn-secondary flex items-center space-x-2">
                                <Info size={16} />
                                <span>Ouvrir</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;