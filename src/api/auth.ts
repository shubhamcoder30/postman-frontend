import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface SignupData {
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            email: string;
            createdAt: string;
        };
        token: string;
    };
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

export const authApi = {
    signup: async (data: SignupData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (otp: string, newPassword: string) => {
        const response = await apiClient.post('/auth/reset-password', { otp, newPassword });
        return response.data;
    },
};

export default apiClient;
