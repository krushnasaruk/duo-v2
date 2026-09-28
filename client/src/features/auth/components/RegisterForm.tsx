import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@codequest/shared';
import { fetchApi } from '@/lib/api-client';
import { useAuth } from '../AuthContext';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CREATOR' // Creators are registering here
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null);
      const response = await fetchApi<{ user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      login(response.user);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto p-6 bg-card border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Creator Registration</h2>
      
      {error && (
        <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input 
          {...register('display_name')} 
          type="text" 
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.display_name && <p className="text-sm text-destructive mt-1">{errors.display_name.message}</p>}
      </div>

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
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
