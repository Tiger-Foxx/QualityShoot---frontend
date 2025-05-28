// Service pour les interactions avec Electron
interface ElectronAPI {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    selectFiles: () => Promise<string[]>;
    selectFolder: () => Promise<string>;
    openFile: (filePath: string) => Promise<void>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

class ElectronService {
    private isElectron(): boolean {
        return !!window.electronAPI;
    }

    openFolder(folderPath: string): void {
        if ((window as any).electronAPI?.openFolder) {
            (window as any).electronAPI.openFolder(folderPath);
        } else {
            // Fallback web
            window.open('file://' + folderPath.replace(/\\/g, '/'));
        }
    }


    async selectFiles(): Promise<string[]> {
        if (this.isElectron() && window.electronAPI) {
            try {
                return await window.electronAPI.selectFiles();
            } catch (error) {
                console.error('Erreur sélection fichiers:', error);
                return [];
            }
        }

        // Fallback pour le navigateur web
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '*';

            input.onchange = () => {
                const files = Array.from(input.files || []);
                const filePaths = files.map(file => URL.createObjectURL(file));
                resolve(filePaths);
            };

            input.click();
        });
    }
    async selectFilesVideo(): Promise<string[]> {
        if (this.isElectron() && window.electronAPI) {
            try {
                return await window.electronAPI.selectFiles();
            } catch (error) {
                console.error('Erreur sélection fichiers:', error);
                return [];
            }
        }

        // Fallback pour le navigateur web
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '*';

            input.onchange = () => {
                const files = Array.from(input.files || []);
                const filePaths = files.map(file => URL.createObjectURL(file));
                resolve(filePaths);
            };

            input.click();
        });
    }

    async selectFolder(): Promise<string> {
        if (this.isElectron() && window.electronAPI) {
            try {
                return await window.electronAPI.selectFolder();
            } catch (error) {
                console.error('Erreur sélection dossier:', error);
                return '';
            }
        }

        // Fallback pour le navigateur web
        return '';
    }

    async minimizeWindow(): Promise<void> {
        if (this.isElectron() && window.electronAPI) {
            await window.electronAPI.minimize();
        }
    }

    async maximizeWindow(): Promise<void> {
        if (this.isElectron() && window.electronAPI) {
            await window.electronAPI.maximize();
        }
    }

    async closeWindow(): Promise<void> {
        if (this.isElectron() && window.electronAPI) {
            await window.electronAPI.close();
        }
    }

    getEnvironment(): 'electron' | 'web' {
        return this.isElectron() ? 'electron' : 'web';
    }

    // Utilitaires pour les chemins de fichiers
    getFileName(filePath: string): string {
        return filePath.split(/[/\\]/).pop() || 'Unknown';
    }

    getFileExtension(filePath: string): string {
        const name = this.getFileName(filePath);
        const lastDot = name.lastIndexOf('.');
        return lastDot !== -1 ? name.substring(lastDot) : '';
    }

    isImageFile(filePath: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp', '.heic'];
        const ext = this.getFileExtension(filePath).toLowerCase();
        return imageExtensions.includes(ext);
    }

    isVideoFile(filePath: string): boolean {
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.gif'];
        const ext = this.getFileExtension(filePath).toLowerCase();
        return videoExtensions.includes(ext);
    }




}

export const electronService = new ElectronService();
export default electronService;