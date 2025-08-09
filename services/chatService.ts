import { api } from './api';
import { User, ChatThread, ChatMessage } from '../types';

export const chatService = {
    async getThreads(): Promise<ChatThread[]> {
        return api.get<ChatThread[]>('/chats/threads');
    },

    async sendMessage(text: string, receiverId: string): Promise<ChatMessage> {
        return api.post<ChatMessage>('/chats/send', { text, receiverId });
    },

    async markMessagesAsRead(threadUserId: string): Promise<void> {
        await api.put<void>(`/chats/threads/${threadUserId}/read`, {});
    },
    
    async deleteThread(threadId: string): Promise<void> {
        await api.delete<void>(`/chats/threads/${threadId}`);
    },

    // Note: The concept of a simple daily limit might be better enforced on the backend.
    // This client-side check is illustrative but not secure.
    // The backend should be the ultimate authority.
    async getRemainingMessages(): Promise<{limit: number, remaining: number}> {
        try {
            return await api.get<{limit: number, remaining: number}>('/chats/limit');
        } catch (e) {
            console.error("Could not fetch message limit", e);
            return { limit: 0, remaining: 0 };
        }
    },

    // This is a helper function and doesn't need to be part of the service anymore
    // as admin user is just another user from the backend's perspective.
    // async getAdminUser(): Promise<User | undefined> {
    //     ...
    // }
};