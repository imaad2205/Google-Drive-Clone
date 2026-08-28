import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const { forgotPassword } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    try {
      const result = await forgotPassword(formData.email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We have sent a password reset link to your email."
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <div className="space-y-2">
            <p className="text-slate-600">
              Did not receive the email? Check your spam folder or try another email address.
            </p>
          </div>

          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to log in
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a reset link"
      icon={<Lock className="w-8 h-8 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "pl-10 h-11 transition-colors",
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-brand-500 focus:ring-brand-500/20"
              )}
              disabled={loading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-50 text-sm text-red-600 border border-red-200"
          >
            {errors.general}
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sending link...
            </motion.div>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
