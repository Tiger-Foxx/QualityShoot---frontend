import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'

// import './styles/globals.css';
import './styles/components.css';

// Vérifier la disponibilité du serveur au démarrage
const checkServerOnStartup = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/health');
        if (response.ok) {
            console.log('✅ Serveur backend connecté');
        }
    } catch (error) {
        console.warn('⚠️ Serveur backend non disponible');
    }
};

checkServerOnStartup();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);