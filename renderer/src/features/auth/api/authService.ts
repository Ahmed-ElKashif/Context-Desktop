import { api } from '../../../lib/axios';
import { type LoginFormValues, type RegisterFormValues, type AuthResponse } from '../schemas/auth.schema';

export const authService = {
  // Call POST /api/auth/login
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    // Your backend returns { success: true, user: {...} } (cookie is set automatically)
    return response.data; 
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/me', {
      _skipAuthExpired: true,
    } as any);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Call POST /api/auth/register
  register: async (userData: RegisterFormValues): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, passwordStr: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/reset-password', { token, password: passwordStr });
    return response.data;
  },
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>(`/auth/verify-email?token=${token}`);
    return response.data;
  },
  updateProfile : async (userData: { persona?: string; fullName?: string; username?: string; email?: string; password?: string; currentPassword?: string }) => {
  const response = await api.patch("/users/profile", userData);
  
  return response.data;
},
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/avatar', formData);
    return response.data;
  },
  
};


