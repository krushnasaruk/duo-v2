import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@codequest/shared';
import { fetchApi } from '@/lib/api-client';
import { useAuth } from '../AuthContext';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      const response = await fetchApi<{ user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      login(response.user);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto p-6 bg-card border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Creator Login</h2>
      
      {error && (
        <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          {...register('email')} 
          type="email" 
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input 
          {...register('password')} 
          type="password" 
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
