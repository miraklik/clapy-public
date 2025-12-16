'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Key, Plus, Trash2, Copy, Check, 
  AlertTriangle, Terminal, ArrowLeft, Sparkles, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type APIKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.key);
        setKeys([data.info, ...keys]);
        setNewKeyName('');
      }
    } catch (error) {
      console.error('Failed to create key', error);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      setKeys(keys.filter((k) => k.id !== id));
    } catch (error) {
      console.error('Failed to delete key', error);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const closeCreation = () => {
    setIsCreating(false);
    setGeneratedKey(null);
    setIsCopied(false);
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

        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors text-sm group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Terminal className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300">
                    API Keys
                </h1>
              </div>
              <p className="text-slate-400 max-w-lg">Manage access keys for CI/CD integrations and external automated scripts.</p>
            </div>
            
            {!isCreating && !generatedKey && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 border-0 h-11 px-6 rounded-xl font-medium transition-all hover:scale-105"
              >
                <Plus size={18} className="mr-2" /> Generate New Key
              </Button>
            )}
          </div>

          <AnimatePresence>
            {(isCreating || generatedKey) && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-8 rounded-3xl border border-blue-500/30 bg-blue-950/40 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                
                {!generatedKey ? (
                  <form onSubmit={handleCreateKey} className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" /> Create New Access Key
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                        <label className="text-xs font-bold text-blue-300 uppercase tracking-wider ml-1">Key Name</label>
                        <Input 
                            placeholder="e.g. GitHub Actions, Production Server" 
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="bg-slate-900/50 border-slate-700/50 focus:border-blue-500 text-white h-11 rounded-xl"
                            autoFocus
                        />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                        <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="h-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-6 rounded-xl flex-1 md:flex-none">Create Key</Button>
                        </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-start gap-4 text-amber-300 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                      <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Save this key now!</h3>
                        <p className="text-sm opacity-90 leading-relaxed mt-1">
                          This is the only time we will show you the full API key. 
                          If you lose it, you will need to generate a new one.
                        </p>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-green-400 break-all pr-14 shadow-inner text-lg tracking-wide">
                        {generatedKey}
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="absolute right-3 top-3 p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all active:scale-95"
                      >
                        {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={closeCreation} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 h-11 px-6 rounded-xl">
                        I have saved it securely
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 text-sm">Loading secure keys...</p>
               </div>
            ) : keys.length === 0 ? (
               <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                 <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                   <Key className="text-slate-500 w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">No API Keys Found</h3>
                 <p className="text-slate-400 text-sm max-w-sm mx-auto">Create a key to start integrating Clapy with your development workflow.</p>
               </div>
            ) : (
              keys.map((key, idx) => (
                <motion.div 
                  key={key.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group backdrop-blur-md"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <Key className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{key.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <code className="text-xs bg-black/40 px-2.5 py-1 rounded-md text-slate-300 font-mono border border-white/5">
                          {key.prefix}
                        </code>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                          Active since {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-10 h-10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </Button>
                </motion.div>
              ))
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}