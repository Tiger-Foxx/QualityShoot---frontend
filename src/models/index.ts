// Export centralisé de tous les types
export * from './FileTypes';
export * from './UpscaleRequest';

// Types utilitaires
export interface AppSettings {
    theme: 'light' | 'dark';
    defaultAIModel: string;
    defaultOutputPath: string;
    autoCleanup: boolean;
    notifications: boolean;
}

export interface NotificationData {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
}