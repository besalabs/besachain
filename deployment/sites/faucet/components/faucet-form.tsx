'use client';

import { useState } from 'react';
import { Droplets, Loader2, CheckCircle, AlertCircle, Clock, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidAddress, shortenAddress } from '@/lib/utils';

const AMOUNT_OPTIONS = [0.1, 0.5, 1, 5];

export function FaucetForm() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidAddress(address)) {
      setResult({ success: false, message: 'Please enter a valid Ethereum address' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (in production, this would be an actual API call)
    setResult({
      success: true,
      message: `Successfully sent ${amount} test BESA to your wallet`,
      txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    });
    
    setCooldown(3600); // 1 hour cooldown
    setIsLoading(false);
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Droplets className="w-8 h-8 text-white animate-drop" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Testnet Faucet</h1>
          <p className="text-white/80 text-sm">Get free test BESA tokens for development</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-emerald-500 transition-all font-mono text-sm"
              />
              {address && !isValidAddress(address) && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Invalid address format
                </p>
              )}
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (test BESA)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AMOUNT_OPTIONS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      amount === amt
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• One request per hour per address</p>
                  <p>• Max 5 BESA per request</p>
                  <p>• Tokens have no real value</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock className="w-5 h-5" />
                  Wait {formatCooldown(cooldown)}
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5" />
                  Request {amount} BESA
                </>
              )}
            </button>
          </form>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div
                  className={`p-4 rounded-xl ${
                    result.success
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          result.success ? 'text-emerald-800' : 'text-red-800'
                        }`}
                      >
                        {result.success ? 'Success!' : 'Error'}
                      </p>
                      <p
                        className={`text-sm ${
                          result.success ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {result.message}
                      </p>
                      {result.txHash && (
                        <a
                          href={`https://testnet-explorer.besachain.com/tx/${result.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-600 hover:text-emerald-700 underline mt-2 inline-block"
                        >
                          View on Explorer →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">2.5M+</div>
          <div className="text-sm text-slate-500">Tokens Sent</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">12.5K</div>
          <div className="text-sm text-slate-500">Requests</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">5,800+</div>
          <div className="text-sm text-slate-500">Developers</div>
        </div>
      </div>
    </div>
  );
}
