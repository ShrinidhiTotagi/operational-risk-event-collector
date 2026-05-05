import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@internship.com',
      password: 'password123'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-900/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-blue-900/20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary-500/10 p-4 border border-primary-500/20">
            <ShieldAlert className="h-12 w-12 text-primary-500" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Risk<span className="text-primary-500">Collector</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Operational Risk Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-dark-card py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-dark-border backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 bg-dark-bg text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register("password", { required: "Password is required" })}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 bg-dark-bg text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">Use default credentials to login</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
