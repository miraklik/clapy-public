'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ArrowLeft, Calendar, Clock, FileCode, 
  ShieldAlert, ShieldCheck, ChevronRight, 
  ChevronLeft, Timer, Search, Activity, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Vulnerability = {
  type: string;
  severity: string;
  line: number;
  description: string;
  explanation: string;
  fix?: string;
};

type Scan = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  language: string;
  fileName: string | null;
  aiFixApplied: boolean;
  scanDurationMs: number;
  createdAt: string;
  vulnerabilities?: Vulnerability[];
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Completed
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Pending
    </span>
  );
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const limit = 10;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchHistory = async (currentPage: number) => {
    setLoading(true);
    const offset = (currentPage - 1) * limit;

    try {
      const res = await fetch(`/api/scan/user?limit=${limit}&offset=${offset}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory(page);
    }
  }, [user, page]);

  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-200 p-6 relative overflow-hidden">
        
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          <header className="mb-10">
             <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors text-sm mb-4 group">
               <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Command Center
             </Link>
             
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-blue-400 font-mono text-xs tracking-[0.2em] uppercase font-semibold">System Logs</span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300">
                    Scan History
                 </h1>
                 <p className="text-slate-400 mt-2 max-w-lg">
                    Comprehensive archive of your smart contract security audits and AI-driven remediations.
                 </p>
               </div>
             </div>
          </header>

          {loading && scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
               <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
               <p className="text-slate-400 font-mono text-sm">Synchronizing ledger...</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-16 text-center backdrop-blur-md">
               <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                 <Search className="w-10 h-10 text-slate-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No audits found</h3>
               <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                 Your repository is empty. Initialize your first security scan to secure your smart contracts.
               </p>
               <Link href="/dashboard/scan">
                 <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl px-8 h-12 font-semibold shadow-lg">
                   Initialize Scan
                 </Button>
               </Link>
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {scans.map((scan) => {
                const vulnCount = scan.vulnerabilities?.length || 0;
                const criticalCount = scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0;
                const highCount = scan.vulnerabilities?.filter(v => v.severity === 'high').length || 0;

                return (
                  <motion.div variants={item} key={scan.id}>
                    <Link href={`/dashboard/scan/${scan.id}`}>
                      <div className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/10 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
                          
                          <div className="flex items-start gap-5">
                             <div className={cn(
                               "p-4 rounded-xl border transition-colors",
                               scan.status === 'completed' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-slate-800/50 border-slate-700 text-slate-400"
                             )}>
                               <FileCode className="w-6 h-6" />
                             </div>
                             
                             <div>
                               <div className="flex items-center gap-3 mb-2">
                                 <h3 className="text-white text-lg font-bold truncate max-w-[200px] md:max-w-md group-hover:text-blue-300 transition-colors">
                                   {scan.fileName || 'Untitled Contract'}
                                 </h3>
                                 <StatusBadge status={scan.status} />
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
                                 <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
                                   <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                   {scan.language}
                                 </span>
                                 <span className="flex items-center gap-1.5">
                                   <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                   {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 {scan.scanDurationMs > 0 && (
                                   <span className="flex items-center gap-1.5">
                                     <Timer className="w-3.5 h-3.5 text-slate-500" />
                                     {(scan.scanDurationMs / 1000).toFixed(2)}s
                                   </span>
                                 )}
                               </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-8 pl-16 md:pl-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                             
                             <div className="flex items-center gap-2 text-sm">
                               {scan.status === 'completed' ? (
                                 <>
                                   {vulnCount === 0 ? (
                                     <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                       <ShieldCheck className="w-4 h-4" />
                                       <span className="font-bold">Secure</span>
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-4 bg-slate-900/40 px-4 py-2 rounded-xl border border-white/5">
                                       {criticalCount > 0 && (
                                          <div className="flex flex-col items-center">
                                            <span className="text-red-400 font-bold text-lg leading-none">{criticalCount}</span>
                                            <span className="text-[9px] text-red-400/70 uppercase tracking-wider font-bold mt-1">Crit</span>
                                          </div>
                                       )}
                                       {highCount > 0 && (
                                          <div className="flex flex-col items-center">
                                            <span className="text-orange-400 font-bold text-lg leading-none">{highCount}</span>
                                            <span className="text-[9px] text-orange-400/70 uppercase tracking-wider font-bold mt-1">High</span>
                                          </div>
                                       )}
                                       {(criticalCount === 0 && highCount === 0) && (
                                          <div className="flex items-center gap-2 text-yellow-400">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-bold">Warnings Found</span>
                                          </div>
                                       )}
                                       
                                       {(criticalCount > 0 || highCount > 0) && (
                                          <div className="w-px h-8 bg-white/10 mx-1" />
                                       )}

                                       <div className="flex flex-col items-center">
                                            <span className="text-white font-bold text-lg leading-none">{vulnCount}</span>
                                            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Total</span>
                                       </div>
                                     </div>
                                   )}
                                 </>
                               ) : (
                                 <span className="text-slate-500 text-xs font-mono">Syncing...</span>
                               )}
                             </div>

                             <div className="p-2 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                             </div>
                          </div>

                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {scans.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              
              <span className="text-sm font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                Page {page}
              </span>

              <Button
                onClick={() => setPage(p => p + 1)}
                disabled={scans.length < limit || loading}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}