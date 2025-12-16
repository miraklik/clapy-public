'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  CloudUpload, FileCode, Shield, Cpu, AlertCircle, X, 
  CheckCircle2, Link, ChevronDown, Rocket, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NETWORKS = [
  { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '/sol.svg', type: 'svg' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '/eth.svg', type: 'svg' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', icon: '/sui.svg', type: 'svg' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT', icon: '/aptos.svg', type: 'svg' },
  { id: 'bsc', name: 'Binance Smart Chain', symbol: 'BSC', icon: '/bnb.svg', type: 'svg' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: '/pol.svg', type: 'svg' },
  { id: 'tron', name: 'Tron', symbol: 'TRX', icon: '/trx.svg', type: 'svg' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', icon: '/avax.svg', type: 'svg' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', icon: '/arb.svg', type: 'svg' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', icon: '/op.svg', type: 'svg' },
];

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ScanPage() {
  const [inputType, setInputType] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>(NETWORKS[0].id); 
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (inputType !== 'file') return;
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.sol', '.rs', '.move'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Unsupported file type. Please upload .sol, .rs, or .move files.');
      setFile(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large (max 15MB).');
      setFile(null);
      return;
    }

    setError('');
    setFile(file);
    
    if (fileName.endsWith('.sol')) setSelectedNetwork('ethereum');
    if (fileName.endsWith('.rs')) setSelectedNetwork('solana');
    if (fileName.endsWith('.move')) setSelectedNetwork('solana');
  };

  const handleSubmit = async () => {
    if (inputType === 'file' && !file) return;
    if (inputType === 'url' && !url) {
      setError('Please enter a valid contract URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let res;

      if (inputType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('network', selectedNetwork);
        
        res = await fetch('/api/scan', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

      } else {
        res = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            url,
            network: selectedNetwork 
          }),
        });
      }

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Scan failed: ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid server response');
      }
      
      if (!data.id) throw new Error('Invalid server response (no ID)');

      // Перенаправление на страницу результатов
      window.location.href = `/dashboard/scan/${encodeURIComponent(data.id)}`;
      
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to start scan');
      setIsLoading(false);
    }
  };

  const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

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
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-blue-300 tracking-wider uppercase">Secure Code Audit v2.0</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Smart Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">Scanner</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Upload your Solidity, Rust, or Move code. Select your network for enhanced context-aware analysis.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
           
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

           <div className="flex p-1 bg-slate-950/50 rounded-xl mb-8 border border-white/5 w-fit mx-auto relative">
              {(['file', 'url'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setInputType(type); setError(''); }}
                  className={cn(
                    "relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10",
                    inputType === type ? "text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {inputType === type && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2 z-10">
                    {type === 'file' ? <CloudUpload className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                    {type === 'file' ? 'Upload File' : 'Explorer URL'}
                  </span>
                </button>
              ))}
           </div>

           <div className="space-y-6">
              
              <div className="min-h-[220px] flex flex-col justify-center relative">
                {inputType === 'file' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group h-full overflow-hidden",
                      isDragging 
                        ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                        : "border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/30",
                      file ? "border-green-500/50 bg-green-500/5" : "bg-slate-900/20"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".sol,.rs,.move"
                      onChange={handleFileSelect}
                    />

                    <AnimatePresence mode="wait">
                      {!file ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col items-center text-center relative z-10"
                        >
                          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl border border-white/5">
                            <CloudUpload className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          </div>
                          <p className="text-lg font-medium text-white mb-2">
                            Drop smart contract here
                          </p>
                          <p className="text-sm text-slate-500">
                            or click to browse (.sol, .rs, .move)
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="file"
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center w-full relative z-10"
                        >
                          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <FileCode className="w-10 h-10 text-green-400" />
                          </div>
                          <p className="text-xl font-semibold text-white mb-1 truncate max-w-[80%]">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-400 mb-6">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-sm transition-colors flex items-center gap-2 border border-white/5"
                          >
                            <X className="w-4 h-4" /> Remove File
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-4 justify-center h-full px-2"
                  >
                    <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                      <label className="block text-sm font-medium text-slate-300 mb-3 ml-1">
                        Contract Address URL
                      </label>
                      <div className="relative group/input">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-0 group-focus-within/input:opacity-50 transition duration-300 blur" />
                        <div className="relative flex items-center">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                            <input
                            type="text"
                            placeholder="https://etherscan.io/address/0x..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-transparent relative z-10"
                            />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {inputType === 'file' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-900/30 p-5 rounded-2xl border border-slate-700/30"
                >
                   <label className="block text-sm font-medium text-slate-300 mb-3">
                      Target Blockchain / Whitepaper Context
                   </label>
                   <div className="relative group/select">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover/select:opacity-100 transition duration-300" />
                      <div className="relative flex items-center">
                        {selectedNetworkData && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                            {selectedNetworkData.type === 'svg' ? (
                              <img 
                                src={selectedNetworkData.icon} 
                                alt={selectedNetworkData.name}
                                className="w-5 h-5"
                              />
                            ) : (
                              <span className="text-base font-bold text-white">
                                {selectedNetworkData.icon}
                              </span>
                            )}
                          </div>
                        )}
                        <select
                            value={selectedNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            className="w-full appearance-none bg-slate-950 border border-slate-700/50 rounded-xl py-3.5 pl-14 pr-12 text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer hover:bg-slate-900 transition-colors"
                        >
                            {NETWORKS.map(net => (
                                <option key={net.id} value={net.id}>
                                {net.name} ({net.symbol})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      The AI will use the selected network's official documentation to audit logic.
                   </p>
                </motion.div>
              )}

              {inputType === 'url' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4"
                >
                   <div className="mt-1 p-2 bg-blue-500/10 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-400" />
                   </div>
                   <div>
                      <p className="text-sm font-medium text-blue-300 mb-1">Supported EVM Networks</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                         URL scanning currently supports all major EVM-compatible networks (Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, etc). The network is automatically detected from the URL.
                      </p>
                   </div>
                </motion.div>
              )}

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
              </AnimatePresence>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={(inputType === 'file' && !file) || (inputType === 'url' && !url) || isLoading}
                className={cn(
                  "w-full h-16 rounded-xl font-bold text-lg relative overflow-hidden transition-all duration-300 group",
                  isLoading 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] hover:scale-[1.01]"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Contract...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    <span>
                      Start Audit 
                      {inputType === 'file' && selectedNetworkData && ` (${selectedNetworkData.name})`}
                    </span>
                  </div>
                )}
              </button>
           </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center max-w-2xl w-full">
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">Whitepaper Aware</p>
           </div>
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
              <Cpu className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">Deep Analysis</p>
           </div>
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">Auto-Fixes</p>
           </div>
        </div>

      </motion.div>
    </div>
  );
}