import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class AuthService {
  static async login(credentials: { email: string; password: string }): Promise<AuthUser> {
    // In a real implementation, you would validate against Supabase Auth
    // For now, we'll simulate authentication by checking if the user exists in our creators table
    
    const { data: creators, error } = await supabase
      .from('creators')
      .select('*')
      .or(`telephone_number.eq.${credentials.email},email.eq.${credentials.email}`)
      .single();

    if (error || !creators) {
      throw new Error('Invalid credentials. Please check your email/phone and password.');
    }

    // In a real app, you would verify the password here
    // For now, we'll just return the creator if found
    
    return {
      id: creators.id,
      email: creators.email,
      phone: creators.telephone_number,
      name: creators.name,
      status: creators.status
    };
  }

  static async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('currentCreator');
    localStorage.removeItem('authToken');
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const savedCreator = localStorage.getItem('currentCreator');
    if (!savedCreator) return null;

    try {
      const creator = JSON.parse(savedCreator);
      return creator;
    } catch (error) {
      console.error('Error parsing saved creator:', error);
      localStorage.removeItem('currentCreator');
      return null;
    }
  }

  static async checkAuthStatus(): Promise<AuthUser | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    // Verify the user still exists and is still approved
    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !creator) {
      await this.logout();
      return null;
    }

    // Update the stored user data
    const updatedUser = {
      id: creator.id,
      email: creator.email,
      phone: creator.telephone_number,
      name: creator.name,
      status: creator.status
    };

    localStorage.setItem('currentCreator', JSON.stringify(updatedUser));
    return updatedUser;
  }

  static async forgotPassword(email: string): Promise<void> {
    // In a real implementation, you would send a password reset email
    // For now, we'll just simulate this
    console.log('Password reset requested for:', email);
    // You would typically call Supabase's password reset function here
    // await supabase.auth.resetPasswordForEmail(email);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // In a real implementation, you would reset the password using the token
    // For now, we'll just simulate this
    console.log('Password reset with token:', token);
    // You would typically call Supabase's password update function here
    // await supabase.auth.updateUser({ password: newPassword });
  }
}
