import React, { useState } from 'react';
import { Home, Zap, Settings } from 'lucide-react';
import HomePage from './pages/HomePage';
import UpscalePage from './pages/UpscalePage';
import SettingsPage from './pages/SettingsPage';

type PageType = 'home' | 'upscale' | 'settings';

function App() {
     const [currentPage, setCurrentPage] = useState<PageType>('home');

    const menuItems = [
        { id: 'home', label: 'Home', icon: Home, page: 'home' as PageType },
        { id: 'upscale', label: 'Upscale', icon: Zap, page: 'upscale' as PageType },
        { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' as PageType }
    ];

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage />;
            case 'upscale': return <UpscalePage />;
            case 'settings': return <SettingsPage />;
            default: return <UpscalePage />;
        }
    };

    return (
        <div className="h-screen bg-[#1e1e1e] text-white flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-16 bg-[#2d2d2d] border-r border-gray-700 flex flex-col">
                {/* App Logo */}
                <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={18} />
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentPage(item.page)}
                                className={`w-full h-12 flex items-center justify-center transition-all duration-200 relative group ${
                                    currentPage === item.page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                                }`}
                                title={item.label}
                            >
                                <item.icon size={20} />

                                {/* Active indicator */}
                                {currentPage === item.page && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full" />
                                )}

                                {/* Tooltip */}
                                <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </nav>

            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar with Window Controls */}
                <div className="h-10 bg-[#2d2d2d] border-b border-gray-700 flex items-center justify-between px-4">
                    <div className="text-sm text-gray-400">QualityShoot Pro</div>

                    {/* Window Controls */}
                    <div className="flex items-center space-x-2">
                        <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors" />
                        <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors" />
                        <button className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors" />
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-hidden">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;