'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { 
  Shield, Zap, Key, LogOut, 
  Activity, History, ChevronRight, Crown, CheckCircle2,
  Pencil, Check, X, Loader2, Mail, Terminal, Sparkles,
  Rocket, TrendingUp, Code
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PaymentSuccessModal } from '@/components/payment-success.modal';

type Subscription = {
  planName: string;
  isActive: boolean;
  endsAt: string;
};

type UserLimits = {
  plan: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<UserLimits>({ plan: 'free', used: 0, limit: 5, isUnlimited: false });
  const [loading, setLoading] = useState(true);

  // Состояния для UI эффектов
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState<Date | null>(null);

  // Состояния для редактирования Email
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Эффект часов и мыши
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/user/limits', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setLimits(data);
      }
    } catch (err) {
      console.error('Failed to load limits:', err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchSubscription(), fetchLimits()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) {
      setIsEditingEmail(false);
      return;
    }
    
    if (!newEmail.includes('@')) return; 

    setIsUpdatingEmail(true);
    try {
      const res = await fetch(`/api/user/${user?.id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      if (res.ok) {
        setIsEditingEmail(false);
        window.location.reload(); 
      } else {
        console.error("Failed to update");
      }
    } catch (err) {
      console.error('Error updating email:', err);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePaymentSuccess = () => {
    refreshData();
  };

  if (!user || (loading && !subscription)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
         {/* Лоадер с фоновыми эффектами */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-mono text-sm">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const isProOrEnterprise = subscription?.planName === 'pro' || subscription?.planName === 'enterprise';
  const usagePercent = limits.isUnlimited ? 0 : (limits.used / limits.limit) * 100;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden p-6 lg:p-8">
        <PaymentSuccessModal onSuccess={handlePaymentSuccess} />
        
        {/* === АНИМИРОВАННЫЙ ФОН (Украдено из дизайна) === */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Градиентные шары, следующие за мышью */}
            <div 
              className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{ 
                left: `${mousePosition.x * 0.02}px`, 
                top: `${mousePosition.y * 0.02}px` 
              }}
            />
            <div 
              className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{ 
                right: `${mousePosition.x * 0.01}px`, 
                bottom: `${mousePosition.y * 0.01}px` 
              }}
            />
            {/* Статичные акценты */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            
            {/* Сетка */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
            
            {/* Частицы */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* === HEADER (Обновленный стиль) === */}
          <header className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl transform group-hover:scale-105 transition-transform">
                      {user.email?.[0].toUpperCase()}
                    </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Command Center
                    </h1>
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {time ? `${time.toLocaleTimeString()} • ${time.toLocaleDateString()}` : '...'}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="group px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all flex items-center gap-2 backdrop-blur-sm h-auto"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Sign Out</span>
              </Button>
            </div>
          </header>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* === ЛЕВАЯ КОЛОНКА (Основная) === */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* КАРТОЧКА ЗАПУСКА СКАНА (Новый дизайн) */}
               <motion.div variants={item}>
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-blue-500/30 p-8 hover:border-blue-400/50 transition-all duration-500 shadow-2xl">
                  {/* Эффекты ховера */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="px-4 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-mono border border-green-400/30 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        SYSTEM READY
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Launch Security Scan
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-xl text-lg">
                      Upload smart contracts for instant AI-powered vulnerability detection and automated fixes.
                    </p>
                    
                    <Link href="/dashboard/scan">
                        <button className="group/btn relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] w-full sm:w-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <span className="relative flex items-center justify-center gap-2">
                            Initiate Scan
                            <Rocket className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                        </button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* МИНИ-СТАТИСТИКА (Новый блок) */}
              <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: TrendingUp, label: 'Scans This Month', value: limits.used, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
                    { icon: Shield, label: 'Current Plan', value: isProOrEnterprise ? (subscription?.planName === 'enterprise' ? 'ENT' : 'PRO') : 'FREE', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
                    { icon: Code, label: 'Supported Langs', value: isProOrEnterprise ? 'ALL' : '1', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-all duration-300 shadow-xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative">
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold mb-1 text-white">{stat.value}</p>
                        <p className="text-slate-400 text-xs">{stat.label}</p>
                    </div>
                    </div>
                ))}
              </motion.div>

              {/* ИСТОРИЯ АКТИВНОСТИ */}
              <motion.div variants={item}>
                <div className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-2xl">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                            <History className="w-5 h-5 text-white" />
                       </div>
                       <h3 className="text-xl font-bold">Recent Activity</h3>
                     </div>
                     {isProOrEnterprise ? (
                       <Link href="/dashboard/history" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group">
                         View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </Link>
                     ) : (
                       <span className="text-xs px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Pro feature
                       </span>
                     )}
                   </div>
                   
                   {isProOrEnterprise ? (
                     <div className="text-center py-8 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/20">
                        <p className="text-slate-400 mb-2">No recent scans found.</p>
                        <Link href="/dashboard/scan" className="text-blue-400 text-sm hover:underline">Start your first scan</Link>
                     </div>
                   ) : (
                      <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                        <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
                        <h4 className="font-bold text-white mb-2">Unlock History</h4>
                        <p className="text-sm text-slate-400 mb-4">Upgrade to Pro to save and view your past audit reports.</p>
                        <Link href="/pricing">
                          <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg">
                            Upgrade Now
                          </button>
                        </Link>
                      </div>
                   )}
                </div>
              </motion.div>
            </div>

            {/* === ПРАВАЯ КОЛОНКА (Сайдбар) === */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* КАРТОЧКА ПЛАНА (Новый дизайн с прогресс баром) */}
              <motion.div variants={item}>
                <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/10 p-6 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/60">
                  {isProOrEnterprise && <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />}
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</span>
                      {isProOrEnterprise && <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />}
                    </div>

                    <div className="mb-6">
                        <h3 className={cn(
                            "text-4xl font-bold bg-clip-text text-transparent mb-2",
                            isProOrEnterprise ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" : "bg-gradient-to-r from-white to-slate-400"
                        )}>
                            {isProOrEnterprise ? (subscription?.planName === 'enterprise' ? 'Enterprise' : 'Pro Plan') : 'Free Plan'}
                        </h3>
                        <p className="text-slate-400">
                            {isProOrEnterprise ? 'Premium Access' : 'Basic Access'}
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Monthly Scans</span>
                            <span className={cn("font-mono font-bold", isProOrEnterprise ? "text-green-400" : "text-white")}>
                                {limits.isUnlimited ? '∞' : `${limits.used} / ${limits.limit}`}
                            </span>
                        </div>
                        
                        {!limits.isUnlimited && (
                            <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
                                <div 
                                    className={cn(
                                        "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 shadow-lg",
                                        isProOrEnterprise ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]" : "bg-blue-500"
                                    )}
                                    style={{ width: `${usagePercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-slate-400">
                            {limits.isUnlimited ? 'Unlimited scans available' : `${Math.max(0, limits.limit - limits.used)} scans remaining`}
                        </p>
                    </div>

                    {!isProOrEnterprise && (
                        <Link href="/pricing" className="block">
                        <button className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-white text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]">
                            <div className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Upgrade to Pro
                            </div>
                        </button>
                        </Link>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* КАРТОЧКА АККАУНТА (Новый стиль списка) */}
              <motion.div variants={item}>
                <div className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-2xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Account Settings</h3>
                  <div className="space-y-3">
                    
                    {/* 1. Статус Email */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            {user.isVerified ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Shield className="w-5 h-5 text-red-500" />}
                        </div>
                        <div>
                            <p className="font-medium text-sm">Email Status</p>
                            <p className={cn("text-xs", user.isVerified ? "text-green-400" : "text-red-400")}>
                                {user.isVerified ? 'Verified & Secure' : 'Verification Required'}
                            </p>
                        </div>
                    </div>

                    {/* 2. Редактирование Email */}
                    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      {!isEditingEmail ? (
                         <div 
                           className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors group"
                           onClick={() => { setNewEmail(user.email); setIsEditingEmail(true); }}
                         >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                  <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-sm">Email Address</p>
                                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
                                </div>
                            </div>
                            <Pencil className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                         </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 animate-in fade-in">
                          <Input 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm"
                            placeholder="new@email.com"
                          />
                          <button 
                            onClick={handleUpdateEmail}
                            disabled={isUpdatingEmail}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400"
                          >
                            {isUpdatingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => setIsEditingEmail(false)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. Change Password */}
                    <Link href="/dashboard/change-password">
                      <div className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-400/30 transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                                <Key className="w-5 h-5 text-orange-400" />
                            </div>
                            <span className="font-medium text-sm">Change Password</span>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>

                    {/* 4. API Keys */}
                    <Link href="/dashboard/api-keys">
                      <div className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                              <Terminal className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="font-medium text-sm">API Keys & CI/CD</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>

                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}