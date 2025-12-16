'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Loader2, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Пропсы для обновления родительского компонента
interface PaymentSuccessModalProps {
  onSuccess?: () => void;
}

export function PaymentSuccessModal({ onSuccess }: PaymentSuccessModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'checking' | 'success'>('checking');
  
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setIsOpen(true);
      startPolling();
    }
  }, [searchParams]);

  const startPolling = async () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' }); 
        
        if (res.ok) {
          const data = await res.json();
          
          if (data.planName === 'pro' || data.planName === 'enterprise') {
            clearInterval(interval);
            setStatus('success');
            triggerConfetti();
            
            if (onSuccess) onSuccess();
          }
        }
      } catch (error) {
        console.error("Error polling subscription:", error);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 120000);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleClose = () => {
    setIsOpen(false);
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            {/* Градиент сверху */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${status === 'success' ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-purple-500 animate-pulse'}`} />
            
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mt-2">
              {status === 'checking' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Verifying Payment</h2>
                  <p className="text-slate-400 text-sm">
                    Waiting for blockchain confirmation...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Upgrade Complete!</h2>
                  <p className="text-slate-300 text-sm">
                    You are now on the <span className="text-green-400 font-bold">PRO</span> plan.
                  </p>
                  <Button 
                    onClick={handleClose}
                    className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white"
                  >
                    Start Auditing
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}