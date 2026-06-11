import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Github, Mail, Lock, User as UserIcon, Shield, AlertCircle, BookOpen, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const GoogleIcon = () => (
   <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
   </svg>
);

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
     defaultValues: { role: 'student' }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const role = watch('role');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.post('/auth/register', data);
      
      login(response.data, response.data.token);
      
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (response.data.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else if (response.data.role === 'superadmin') {
        navigate('/superadmin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleGithubLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    window.location.href = `${apiUrl}/auth/github`;
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-[100px] animate-blob"></div>
         <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="max-w-md w-full relative z-10"
      >
        <div className="glass-panel p-8 sm:p-10 border-white/40 dark:border-secondary-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors relative group">
                Log in
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </p>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl flex items-start backdrop-blur-sm"
              >
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pb-2">
               <label className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${role === 'student' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md shadow-primary-500/10' : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-white dark:hover:bg-secondary-800'}`}>
                  <input type="radio" value="student" className="sr-only" {...register('role')} />
                  <UserIcon className={`h-6 w-6 mb-2 ${role === 'student' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400'}`} />
                  <span className={`text-xs md:text-sm font-medium ${role === 'student' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500 dark:text-secondary-400'}`}>Student</span>
               </label>
               <label className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${role === 'admin' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md shadow-primary-500/10' : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-white dark:hover:bg-secondary-800'}`}>
                  <input type="radio" value="admin" className="sr-only" {...register('role')} />
                  <Shield className={`h-6 w-6 mb-2 ${role === 'admin' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400'}`} />
                  <span className={`text-xs md:text-sm font-medium ${role === 'admin' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500 dark:text-secondary-400'}`}>Admin</span>
               </label>
               <label className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${role === 'faculty' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md shadow-primary-500/10' : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-white dark:hover:bg-secondary-800'}`}>
                  <input type="radio" value="faculty" className="sr-only" {...register('role')} />
                  <BookOpen className={`h-6 w-6 mb-2 ${role === 'faculty' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400'}`} />
                  <span className={`text-xs md:text-sm font-medium ${role === 'faculty' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500 dark:text-secondary-400'}`}>Faculty</span>
               </label>
            </div>

            <Input
              id="name"
              type="text"
              label="Full Name"
              icon={UserIcon}
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              placeholder="hi@university.edu"
              error={errors.email?.message}
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "invalid email address" }
              })}
            />
            
            <Input
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password", { 
                 required: "Password is required",
                 minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full text-base py-3"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200 dark:border-secondary-700/80"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-secondary-900 text-secondary-500 font-medium rounded-full border border-secondary-200 dark:border-secondary-700/80">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 group"
                type="button"
              >
                <div className="group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                   <GoogleIcon />
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={handleGithubLogin}
                className="w-full py-2.5 group hover:text-secondary-900 dark:hover:text-white"
                type="button"
              >
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
