import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor,
    Settings,
    Home,
    Upload,
    Zap,
    Menu,
    X,
    Wifi,
    WifiOff
} from 'lucide-react';
import HomePage from './pages/HomePage';
import UpscalePage from './pages/UpscalePage';
import SettingsPage from './pages/SettingsPage';
import { apiService } from './services/apiService';
// import './styles/globals.css';

type PageType = 'home' | 'upscale' | 'settings';

interface SidebarItem {
    id: PageType;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const sidebarItems: SidebarItem[] = [
    {
        id: 'home',
        label: 'Accueil',
        icon: <Home size={20} />,
        description: 'Vue d\'ensemble et statistiques'
    },
    {
        id: 'upscale',
        label: 'Upscaling',
        icon: <Zap size={20} />,
        description: 'Améliorer vos images et vidéos'
    },
    {
        id: 'settings',
        label: 'Paramètres',
        icon: <Settings size={20} />,
        description: 'Configuration et préférences'
    }
];

function App() {
    const [currentPage, setCurrentPage] = useState<PageType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

    // Vérifier la connexion au serveur
    useEffect(() => {
        const checkServerConnection = async () => {
            try {
                const isReachable = await apiService.isServerReachable();
                setServerStatus(isReachable ? 'connected' : 'disconnected');
            } catch {
                setServerStatus('disconnected');
            }
        };

        checkServerConnection();

        // Vérifier toutes les 30 secondes
        const interval = setInterval(checkServerConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'upscale':
                return <UpscalePage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <HomePage />;
        }
    };

    const ServerStatusIndicator = () => (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50">
            {serverStatus === 'connected' ? (
                <>
                    <Wifi size={16} className="text-green-500" />
                    <span className="text-sm text-green-400">Connecté</span>
                </>
            ) : serverStatus === 'disconnected' ? (
                <>
                    <WifiOff size={16} className="text-red-500" />
                    <span className="text-sm text-red-400">Déconnecté</span>
                </>
            ) : (
                <>
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-yellow-400">Vérification...</span>
                </>
            )}
        </div>
    );

    return (
        <div className="container-app bg-gray-950">
            {/* Header avec titre et contrôles */}
            <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Monitor size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gradient">QualityShoot</h1>
                            <p className="text-xs text-gray-400">AI Image & Video Upscaler</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <ServerStatusIndicator />

                    {/* Boutons de contrôle de fenêtre (Electron) */}
                    <div className="hidden lg:flex items-center space-x-2">
                        <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors" />
                        <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors" />
                        <button className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <AnimatePresence>
                    {(sidebarOpen || window.innerWidth >= 1024) && (
                        <motion.aside
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`sidebar-app ${sidebarOpen ? 'open' : ''} lg:relative lg:translate-x-0`}
                        >
                            <nav className="p-6 space-y-2">
                                {sidebarItems.map((item, index) => (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => {
                                            setCurrentPage(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                            currentPage === item.id
                                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className={`transition-transform duration-200 group-hover:scale-110 ${
                                            currentPage === item.id ? 'text-sky-400' : ''
                                        }`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400">
                                                {item.description}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </nav>

                            {/* Footer sidebar */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="glass-effect rounded-xl p-4">
                                    <div className="text-xs text-gray-400 text-center">
                                        <div className="font-semibold text-white mb-1">QualityShoot v1.0</div>
                                        <div>Powered by AI Technology</div>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Overlay pour mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Contenu principal */}
                <main className="main-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default App;