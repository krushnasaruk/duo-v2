import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  if (user) {
    if (user.role === 'CREATOR') return <Navigate to="/creator" replace />;
    return <Navigate to="/dashboard" replace />; // or wherever students go
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">CodeQuest</h1>
          <p className="text-muted-foreground mt-2">Creator Dashboard</p>
        </div>

        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm />
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
