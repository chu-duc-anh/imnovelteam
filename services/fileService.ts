import { api } from './api';

interface UploadResponse {
  url: string;
  file: {
    filename: string;
    id: string;
    // other multer-gridfs-storage props
  };
}

export const fileService = {
  async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.postMultipart<UploadResponse>('/files/upload', formData);
    
    // The backend returns a relative URL like '/api/files/filename.ext'
    return response.url;
  }
};
