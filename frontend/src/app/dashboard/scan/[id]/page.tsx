'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, AlertOctagon, CheckCircle2, 
  Clock, FileCode, Download, Copy, Terminal, 
  Activity, Lock, AlertTriangle, Zap, ChevronRight,
  Check, Sparkles, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Vulnerability = {
  line: number;
  fixed_lines?: number[];
  severity: 'high' | 'medium' | 'low' | 'critical';
  description: string;
  explanation: string;
  fix?: string;
};

type ScanResult = {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'expired'; 
  correctedCode?: string;
  vulnerabilities?: Vulnerability[];
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md flex items-center gap-2",
      styles[severity as keyof typeof styles] || styles.low
    )}>
      <span className={cn("w-2 h-2 rounded-full", 
        severity === 'critical' ? 'bg-red-500 animate-pulse' : 
        severity === 'high' ? 'bg-orange-500' : 
        severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
      )} />
      {severity}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, colorClass, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group relative overflow-hidden bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all duration-300"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative flex items-center gap-4">
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-white font-sans tracking-tight">{value}</p>
      </div>
    </div>
  </motion.div>
);

const CopyButton = ({ code }: { code: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={handleCopy}
      className={cn(
        "h-9 min-w-[90px] transition-all duration-300 rounded-lg border",
        isCopied 
          ? "text-green-400 bg-green-500/10 border-green-500/20" 
          : "text-slate-400 border-transparent hover:text-white hover:bg-white/10 hover:border-white/10"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isCopied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Copied</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
};

export default function ScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'report' | 'code'>('report');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!id) return;
    let timer: NodeJS.Timeout;

    const fetchScan = async () => {
      try {
        const res = await fetch(`/api/scan/${id}`, { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 404) notFound();
          throw new Error('Scan not found');
        }
        const data = await res.json();
        setScan(data);
        if (data.status === 'pending') timer = setTimeout(fetchScan, 2000);
      } catch (err) {
        setError('Failed to load scan result');
      }
    };
    fetchScan();
    return () => clearTimeout(timer);
  }, [id]);

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400 font-sans">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
        <AlertTriangle className="w-6 h-6" /> {error}
      </div>
    </div>
  );

  if (!scan) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Analysis in Progress</h2>
        <p className="text-slate-400 font-mono text-sm animate-pulse">Scanning logic flows & vectors...</p>
      </div>
    </div>
  );

  const fixedLinesSet = new Set(
    scan.vulnerabilities?.flatMap(v => v.fixed_lines || []).filter(line => line > 0) || []
  );

  const stats = {
    critical: scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0,
    high: scan.vulnerabilities?.filter(v => v.severity === 'high').length || 0,
    total: scan.vulnerabilities?.length || 0,
    fixed: fixedLinesSet.size
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-blue-400 font-mono text-xs tracking-[0.2em] uppercase font-semibold">Audit Report</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300 tracking-tight leading-tight">
              Smart Contract Analysis
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-sm text-slate-400 font-mono">
                ID: {id.slice(0, 8)}
              </span>
              <span className="text-slate-500 text-sm flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-400" /> AI-Powered Deep Scan
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {scan.status === 'pending' && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span className="text-blue-300 font-medium text-sm">Engine Running</span>
                </div>
             )}
             
             {scan.status === 'completed' && (
                <div className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                   <CheckCircle2 className="w-4 h-4" /> 
                   <span className="font-medium text-sm">Analysis Complete</span>
                </div>
             )}

             {scan.status === 'expired' && (
                <div className="px-5 py-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full flex items-center gap-2 backdrop-blur-md">
                  <Clock className="w-4 h-4" /> 
                  <span className="font-medium text-sm">Session Expired</span>
                </div>
             )}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatCard 
            icon={AlertOctagon} 
            label="Total Issues" 
            value={stats.total} 
            colorClass="from-slate-700/50 to-slate-800/50" 
            delay={0.1}
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Critical Risks" 
            value={stats.critical} 
            colorClass="from-red-500/20 to-red-600/10" 
            delay={0.2}
          />
          <StatCard 
            icon={Activity} 
            label="High Severity" 
            value={stats.high} 
            colorClass="from-orange-500/20 to-orange-600/10" 
            delay={0.3}
          />
          <StatCard 
            icon={FileCode} 
            label="Lines Patched" 
            value={stats.fixed} 
            colorClass="from-green-500/20 to-green-600/10" 
            delay={0.4}
          />
        </div>

        {(scan.status === 'completed' || scan.status === 'expired') && (
          <div className="space-y-8">
             <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit mb-8 backdrop-blur-sm">
                <button 
                  onClick={() => setActiveTab('report')}
                  className={cn(
                    "px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 relative",
                    activeTab === 'report' ? "text-white bg-white/10 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" /> Vulnerabilities
                </button>
                
                {scan.status === 'completed' && (
                  <button 
                    onClick={() => setActiveTab('code')}
                    className={cn(
                      "px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 relative",
                      activeTab === 'code' ? "text-white bg-white/10 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Code className="w-4 h-4" /> Fixed Code
                  </button>
                )}
             </div>

             <AnimatePresence mode="wait">
               {activeTab === 'report' ? (
                 <motion.div 
                   key="report"
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                 >
                   {scan.vulnerabilities?.length === 0 ? (
                      <div className="text-center py-24 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                          <ShieldCheck className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Code Secure</h3>
                        <p className="text-slate-400">No vulnerabilities detected by the engine.</p>
                      </div>
                   ) : (
                      scan.vulnerabilities?.map((vuln, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 shadow-xl"
                        >
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2",
                            vuln.severity === 'critical' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
                            vuln.severity === 'high' ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]' :
                            vuln.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          )} />
                          
                          <div className="p-8 pl-10">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <SeverityBadge severity={vuln.severity} />
                                <span className="text-slate-400 font-mono text-xs bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                  {vuln.line > 0 ? `Line ${vuln.line}` : 'Global Scope'}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors flex items-center gap-2">
                              {vuln.description}
                            </h3>
                            
                            <p className="text-slate-300 leading-relaxed mb-8 max-w-4xl text-lg opacity-90">
                              {vuln.explanation}
                            </p>

                            {vuln.fix && (
                              <div className="relative rounded-2xl bg-slate-950/50 border border-white/10 overflow-hidden group-hover:border-white/20 transition-colors">
                                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
                                  <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Suggested Fix</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                  </div>
                                </div>
                                <div className="p-6 overflow-x-auto">
                                  <code className="font-mono text-sm text-green-400 block whitespace-pre leading-relaxed">{vuln.fix}</code>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                   )}
                 </motion.div>
               ) : (
                 <motion.div 
                   key="code"
                   initial={{ opacity: 0, scale: 0.98 }} 
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.02 }}
                 >
                   {scan.status === 'completed' && scan.correctedCode ? (
                      <div className="rounded-3xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                          <div className="flex items-center gap-4">
                             <div className="flex gap-2 mr-2">
                               <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                               <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                               <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                             </div>
                             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5">
                                <FileCode className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-300 font-mono">Patched_Contract.sol</span>
                             </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <CopyButton code={scan.correctedCode!} />
                            
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-500 text-white border-0 h-9 rounded-lg font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                              onClick={() => {
                                const blob = new Blob([scan.correctedCode!], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `Audit_${id.slice(0,6)}_Fixed.sol`;
                                a.click();
                              }}
                            >
                              <Download className="w-3.5 h-3.5 mr-2" /> Download
                            </Button>
                          </div>
                        </div>

                        <div className="overflow-x-auto max-h-[700px] overflow-y-auto custom-scrollbar bg-slate-950/50 p-4">
                          <table className="w-full font-mono text-sm border-collapse">
                            <tbody>
                              {scan.correctedCode.split('\n').map((line, idx) => {
                                const num = idx + 1;
                                const isFixed = fixedLinesSet.has(num);
                                return (
                                  <tr key={idx} className={cn(
                                    "hover:bg-white/5 transition-colors rounded-lg",
                                    isFixed && "bg-green-500/10"
                                  )}>
                                    <td className="w-12 px-4 py-1 text-right text-slate-600 select-none text-xs">
                                      {num}
                                    </td>
                                    <td className="px-4 py-1 text-slate-300 whitespace-pre">
                                      <span className={cn(isFixed && "text-green-400 font-medium")}>
                                        {line || ' '}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                   ) : (
                      <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 border-dashed backdrop-blur-sm">
                         <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-slate-500" />
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
                         <p className="text-slate-400">Source code protection enabled. View unavailable.</p>
                      </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}

        {scan.status === 'expired' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-12 text-center py-12 border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent rounded-3xl backdrop-blur-md"
           >
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Security Protocol: Data Purged</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                To ensure maximum security of your intellectual property, 
                the corrected source code has been permanently deleted from our secure enclaves.
              </p>
              <Button className="bg-white text-black hover:bg-slate-200 rounded-xl px-8 h-12 font-bold shadow-lg shadow-orange-900/20 transition-transform hover:scale-105">
                 Start New Audit <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
           </motion.div>
        )}
      </div>
    </div>
  );
}