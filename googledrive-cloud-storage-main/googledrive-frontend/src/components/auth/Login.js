import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import AuthLayout from './AuthLayout';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [needsActivation, setNeedsActivation] = useState(false);
  const [resendingActivation, setResendingActivation] = useState(false);

  const { login, loginWithGoogle, resendActivation } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'email') setNeedsActivation(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const credential = credentialResponse.credential;
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      
      const result = await loginWithGoogle(credential, {
        email: userInfo.email,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        sub: userInfo.sub
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed');
  };

  const handleResendActivation = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setResendingActivation(true);
    try {
      const result = await resendActivation(formData.email);
      if (result.success) {
        setNeedsActivation(false);
        setErrors({});
        toast.success('Activation email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to send activation email');
    } finally {
      setResendingActivation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    setNeedsActivation(false);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        const message = result.message || 'Login failed.';
        setErrors({ general: message });
        
        if (result.needsActivation || message.toLowerCase().includes('not activated')) {
          setNeedsActivation(true);
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your secure cloud storage"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-200",
                errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              )}
              disabled={loading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 flex items-center gap-1"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={cn(
                "pl-11 pr-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-200",
                errors.password && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              )}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Error Message */}
        {errors.general && !needsActivation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-50 border border-red-100"
          >
            <p className="text-sm text-red-600">{errors.general}</p>
          </motion.div>
        )}

        {/* Activation Required */}
        {needsActivation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-50 border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Account not activated</p>
                <p className="text-sm text-amber-700 mt-1">
                  Check your email for the activation link, or click below to resend.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={handleResendActivation}
                  disabled={resendingActivation}
                >
                  {resendingActivation ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-3 w-3" />
                      Resend Activation Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="384"
          />
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
