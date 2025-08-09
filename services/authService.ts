import { api } from './api';
import { User, LeaderboardUser } from '../types';

const AUTH_STORAGE_KEY = 'imnovel_jwt';

interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(username: string, email: string, password: string): Promise<User> {
    const data = await api.post<{user: User}>('/users/register', { username, email, password });
    return data.user;
  },

  async login(loginIdentifier: string, password: string): Promise<User> {
    const data = await api.post<LoginResponse>('/users/login', { loginIdentifier, password });
    if (data.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    }
    return data.user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // No API call needed for logout unless we are blacklisting tokens
    return Promise.resolve();
  },
  
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!token) return Promise.resolve(null);
    try {
        const user = await api.get<User>('/users/me');
        return user;
    } catch (error) {
        console.error("Session expired or invalid:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
      return await api.get<User[]>('/users');
  },

  async getPublicUsers(): Promise<User[]> {
    return await api.get<User[]>('/users/public');
  },

  async updateUserAvatar(userId: string, newAvatarDataUrl: string): Promise<User> {
    // The user ID from the parameter isn't strictly necessary if the backend
    // always updates the currently authenticated user, but we pass it for clarity.
    return await api.put<User>(`/users/profile`, { picture: newAvatarDataUrl });
  },

  async updateUserPassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put<void>('/users/password', { oldPassword, newPassword });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/forgotpassword', { email });
  },

  async resetPassword(token: string, password: string): Promise<User> {
    const data = await api.put<LoginResponse>(`/users/resetpassword/${token}`, { password });
    if (data.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    }
    return data.user;
  },

  async updateUserRace(userId: string, newRace: string): Promise<User> {
    return await api.put<User>(`/users/profile`, { race: newRace });
  },

  async updateUserRole(userId: string, newRole: 'user' | 'admin' | 'contractor'): Promise<void> {
    await api.put<void>(`/users/${userId}/role`, { role: newRole });
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete<void>(`/users/${userId}`);
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
        const { available } = await api.post<{available: boolean}>('/users/check-username', { username });
        return available;
    } catch {
        return false;
    }
  },
  
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
        const { available } = await api.post<{available: boolean}>('/users/check-email', { email });
        return available;
    } catch {
        return false;
    }
  },

  async manageAlly(action: 'add' | 'remove', allyUsername: string): Promise<User> {
    return await api.put<User>('/users/manage-ally', { action, allyUsername });
  },

  async leaveAllyTeam(): Promise<User> {
    return await api.put<User>('/users/leave-ally', {});
  },

  async getLeaderboard(): Promise<LeaderboardUser[]> {
    return await api.get<LeaderboardUser[]>('/users/leaderboard');
  }
};
