'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { 
  Hash, ShieldCheck, Mail, 
  Loader2, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function VerifyEmailForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email') || user?.email;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
        setError('Please enter a valid 6-digit code');
        return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      });

      if (res.ok) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const err = await res.json();
        setError(err.error || 'Invalid or expired code');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || resending) return;
    
    if (!email) {
        setError("Email not found. Please login again.");
        return;
    }

    setResending(true);
    setError('');

    try {
        const res = await fetch('http://localhost:8080/auth/resend-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            setTimer(60); 
        } else {
            const data = await res.json();
            if (res.status === 429) {
                setTimer(60);
            }
            setError(data.error || "Failed to resend code");
        }
    } catch (err) {
        setError("Connection error. Could not send code.");
    } finally {
        setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{ left: `${mousePosition.x * 0.02}px`, top: `${mousePosition.y * 0.02}px` }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{ right: `${mousePosition.x * 0.01}px`, bottom: `${mousePosition.y * 0.01}px` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link 
          href="/login" 
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/20 relative">
              <Mail className="w-8 h-8 text-blue-400" />
              <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-slate-700">
                 <ShieldCheck className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Verify Email</h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
               We've sent a 6-digit security code to <br/>
               <span className="text-blue-400 font-mono font-medium">{email || 'your inbox'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm shadow-inner shadow-red-500/5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm shadow-inner shadow-green-500/5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Verification Successful!</p>
                      <p className="text-xs opacity-90">Redirecting to dashboard...</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Verification Code</label>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(val);
                  }}
                  disabled={loading || success}
                  className="pl-10 h-12 bg-slate-900/50 border-slate-700/50 focus:border-blue-500/50 text-white placeholder:text-slate-700 text-lg tracking-[0.5em] font-mono text-center transition-all rounded-xl"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || success || code.length < 6}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold tracking-wide border-0 transition-all shadow-lg shadow-blue-900/20 hover:scale-[1.02] rounded-xl"
            >
              {loading || success ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Confirm Identity <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <button 
               onClick={handleResendCode}
               disabled={timer > 0 || resending || success}
               className={`text-xs transition-colors flex items-center justify-center mx-auto gap-2
                 ${timer > 0 || resending 
                    ? 'text-slate-500 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-blue-400'
                 }`}
            >
               {resending ? (
                 <>
                   <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                 </>
               ) : timer > 0 ? (
                 <>
                    Resend available in <span className="font-mono font-bold w-6 text-slate-300">{timer}s</span>
                 </>
               ) : (
                 <>
                   Didn't receive the code? <span className="underline decoration-slate-600 underline-offset-4 hover:decoration-blue-400 text-slate-300">Resend Code</span>
                 </>
               )}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}