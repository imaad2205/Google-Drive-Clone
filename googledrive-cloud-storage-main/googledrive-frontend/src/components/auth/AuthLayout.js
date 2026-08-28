import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Zap, Cloud, Lock, Users } from 'lucide-react';

// Premium Logo Component
const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { icon: 'w-8 h-8', text: 'text-lg' },
    default: { icon: 'w-10 h-10', text: 'text-xl' },
    large: { icon: 'w-12 h-12', text: 'text-2xl' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size].icon} relative flex-shrink-0`}>
        {/* Glow effect - contained within parent */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl blur-md opacity-30 scale-95" />
        {/* Main logo */}
        <div className="relative w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Cloud className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent whitespace-nowrap`}>
          CloudVault
        </span>
      )}
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Stats Component
const StatItem = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Panel - Premium Marketing Section */}
      <div className="hidden lg:flex w-1/2 mesh-bg relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mb-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <Logo size="default" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Secure cloud storage for the
              <span className="block mt-2 bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                modern enterprise
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10">
              Store, share, and collaborate on files with enterprise-grade security. 
              Your data, protected by military-grade encryption.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="space-y-4 mb-10">
            <FeatureCard
              icon={Shield}
              title="Bank-Grade Security"
              description="AES-256 encryption protects your files at rest and in transit"
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Global CDN ensures instant access from anywhere in the world"
              color="bg-gradient-to-br from-amber-500 to-orange-500"
              delay={0.5}
            />
            <FeatureCard
              icon={Users}
              title="Team Collaboration"
              description="Share files and folders with granular permission controls"
              color="bg-gradient-to-br from-brand-500 to-purple-500"
              delay={0.6}
            />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-8 pt-8 border-t border-white/10"
          >
            <StatItem value="15GB" label="Free Storage" delay={0.9} />
            <StatItem value="99.9%" label="Uptime SLA" delay={1.0} />
            <StatItem value="256-bit" label="Encryption" delay={1.1} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 flex items-center justify-between text-sm text-slate-500"
        >
          <p>© 2024 CloudVault. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured by AWS</span>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 xl:p-16 relative bg-slate-50 mesh-bg-light">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">CloudVault</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-soft-lg border border-slate-200/60 p-8 xl:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl xl:text-3xl font-bold text-slate-900 mb-2"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-500"
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Form Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>SOC 2 Certified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
