'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Check, X, Zap, Shield, Building2, 
  CreditCard, ArrowRight, Sparkles, Lock, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FeatureItem = ({ included, text }: { included: boolean; text: string }) => (
  <li className="flex items-start gap-3 text-sm group">
    <div className={cn(
      "mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
      included 
        ? "bg-blue-500/20 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/30" 
        : "bg-white/5 border-white/10 text-slate-600"
    )}>
      {included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    </div>
    <span className={cn(
      "leading-tight transition-colors", 
      included ? "text-slate-300 group-hover:text-white" : "text-slate-600"
    )}>
      {text}
    </span>
  </li>
);

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCheckout = async (plan: 'basic' | 'pro' | 'enterprise') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.pay_url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* === АНИМИРОВАННЫЙ ФОН === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{ left: `${mousePosition.x * 0.02}px`, top: `${mousePosition.y * 0.02}px` }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{ right: `${mousePosition.x * 0.01}px`, bottom: `${mousePosition.y * 0.01}px` }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Navigation back */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-blue-300 tracking-wider uppercase font-bold">Transparent Pricing</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Secure Your Contracts with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
              Military-Grade AI
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Choose the level of protection that fits your protocol's TVL and complexity. 
            Upgrade anytime as you scale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          
          {/* === STARTER PLAN === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="mb-8">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Perfect for hobbyists & testing</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem included={true} text="5 Scans per month" />
              <FeatureItem included={true} text="Basic vulnerability detection" />
              <FeatureItem included={true} text="Standard security report" />
              <FeatureItem included={false} text="AI-powered automatic fixes" />
              <FeatureItem included={false} text="Historical scan data" />
              <FeatureItem included={false} text="API Access" />
            </ul>

            <Button 
              disabled 
              className="w-full bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 h-12 rounded-xl font-medium"
            >
              Current Plan
            </Button>
          </motion.div>

          {/* === PRO PLAN (HIGHLIGHTED) === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-900/20 to-purple-900/20 backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.15)] transform md:-translate-y-6 z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none" />
            
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-blue-500/30 flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">$29.99</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
              <p className="text-xs text-blue-300/80 mt-2 font-mono bg-blue-500/10 inline-block px-2 py-1 rounded border border-blue-500/20">Billed monthly via Crypto</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1 relative">
              <FeatureItem included={true} text="50 Scans per month" />
              <FeatureItem included={true} text="Advanced Logic Analysis" />
              <FeatureItem included={true} text="AI-Powered Auto-Fixes" />
              <FeatureItem included={true} text="Full Scan History" />
              <FeatureItem included={true} text="Multi-file support" />
              <FeatureItem included={true} text="Priority Processing Queue" />
              <FeatureItem included={true} text="PDF & JSON Export" />
            </ul>

            <Button 
              onClick={() => handleCheckout('pro')}
              disabled={loading === 'pro'}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              {loading === 'pro' ? (
                 <span className="flex items-center gap-2">
                   <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span> 
                   Processing...
                 </span>
              ) : (
                <span className="flex items-center gap-2">
                  Upgrade Now <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </motion.div>

          {/* === ENTERPRISE PLAN === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="mb-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                <Building2 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$299.99</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">For audit firms & protocols</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem included={true} text="Unlimited Scanning" />
              <FeatureItem included={true} text="Custom Security Rules" />
              <FeatureItem included={true} text="Dedicated API Endpoint" />
              <FeatureItem included={true} text="CI/CD Pipeline Integration" />
              <FeatureItem included={true} text="99.9% SLA & Audit Logs" />
              <FeatureItem included={true} text="24/7 Dedicated Support" />
            </ul>

            <Button 
              onClick={() => handleCheckout('enterprise')}
              disabled={loading === 'enterprise'}
              className="w-full bg-white text-black hover:bg-slate-200 border-0 h-12 rounded-xl font-bold transition-transform hover:scale-[1.02]"
            >
              {loading === 'enterprise' ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black"></span> 
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Purchase Enterprise <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </motion.div>

        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 text-center border-t border-white/5 pt-12"
        >
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Trusted by developers securing</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-3 text-xl font-bold text-white"><Lock className="w-6 h-6" /> DeFi Protocol</div>
            <div className="flex items-center gap-3 text-xl font-bold text-white"><CreditCard className="w-6 h-6" /> WalletApp</div>
            <div className="flex items-center gap-3 text-xl font-bold text-white"><Shield className="w-6 h-6" /> AuditFirm</div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}