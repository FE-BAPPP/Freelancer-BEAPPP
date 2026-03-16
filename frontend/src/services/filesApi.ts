import { API_BASE_URL, FileResponse } from './api';
import { ApiResponse } from '../types/api';

const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers: Record<string, string> = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`; // ✅ FIX: Use userToken first
    return headers;
};

export const filesApi = {
    /**
     * Upload a file
     */
    uploadFile: async (
        file: File,
        entityType: 'JOB' | 'PROPOSAL' | 'PROJECT' | 'MILESTONE' | 'CONVERSATION',
        entityId: string
    ): Promise<ApiResponse<FileResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data', // Do NOT set this manually, let browser set boundary
                ...getAuthHeaders(false), // Pass false to exclude Content-Type: application/json
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
            message: 'File uploaded successfully'
        };
    },

    /**
     * Get files by entity
     */
    getFilesByEntity: async (entityType: string, entityId: string): Promise<ApiResponse<FileResponse[]>> => {
        const response = await fetch(`${API_BASE_URL}/api/files/${entityType}/${entityId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
            message: 'Files fetched successfully'
        };
    },

    /**
     * Delete file
     */
    deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
        const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        return response.json();
    }
};
