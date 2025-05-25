import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
    UpscaleRequest,
    UpscaleResponse,
    ProcessStatusResponse
} from '../models/UpscaleRequest';
import type { FileValidationResponse, FileInfo } from '../models/FileTypes';

const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error);
                return Promise.reject(error);
            }
        );
    }

    async healthCheck(): Promise<any> {
        const response = await this.api.get('/health');
        return response.data;
    }

    async getAvailableModels(): Promise<any> {
        const response = await this.api.get('/api/upscale/models');
        return response.data;
    }

    async validateFiles(filePaths: string[]): Promise<FileValidationResponse> {
        const response: AxiosResponse<FileValidationResponse> = await this.api.post(
            '/api/files/validate',
            filePaths
        );
        return response.data;
    }

    async getFileInfo(filename: string): Promise<FileInfo> {
        const response = await this.api.get(`/api/files/info/${filename}`);
        return response.data;
    }

    async getSupportedFormats(): Promise<{images: string[], videos: string[], video_codecs: string[]}> {
        const response = await this.api.get('/api/files/supported-formats');
        return response.data;
    }

    async cleanupTempFiles(): Promise<{message: string, temp_dir: string}> {
        const response = await this.api.delete('/api/files/cleanup');
        return response.data;
    }

    async startUpscaling(request: UpscaleRequest): Promise<UpscaleResponse> {
        const response: AxiosResponse<UpscaleResponse> = await this.api.post(
            '/api/upscale/start',
            request
        );
        return response.data;
    }

    async getProcessStatus(processId: string): Promise<ProcessStatusResponse> {
        const response: AxiosResponse<ProcessStatusResponse> = await this.api.get(
            `/api/upscale/status/${processId}`
        );
        return response.data;
    }

    async cancelProcess(processId: string): Promise<{message: string, process_id: string}> {
        const response = await this.api.post(`/api/upscale/cancel/${processId}`);
        return response.data;
    }

    async cleanupProcess(processId: string): Promise<{message: string, process_id: string}> {
        const response = await this.api.delete(`/api/upscale/cleanup/${processId}`);
        return response.data;
    }

    async getProcessPreview(processId: string): Promise<any> {
        const response = await this.api.get(`/api/upscale/preview/${processId}`);
        return response.data;
    }

    async downloadFile(filename: string): Promise<Blob> {
        const response = await this.api.get(`/api/files/download/${filename}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    isServerReachable(): Promise<boolean> {
        return this.healthCheck()
            .then(() => true)
            .catch(() => false);
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}

export const apiService = new ApiService();
export default apiService;