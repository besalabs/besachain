'use client';

import { useState } from 'react';
import { ArrowDown, ArrowRightLeft, Clock, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidAddress } from '@/lib/utils';

const tokens = [
  { symbol: 'BESA', name: 'BesaChain', icon: 'B', l1Balance: 1250.5, l2Balance: 500 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', l1Balance: 2.5, l2Balance: 1.2 },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', l1Balance: 5000, l2Balance: 2500 },
  { symbol: 'WBTC', name: 'Wrapped BTC', icon: '₿', l1Balance: 0.1, l2Balance: 0.05 },
];

export function BridgeInterface() {
  const [direction, setDirection] = useState<'l1-to-l2' | 'l2-to-l1'>('l1-to-l2');
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  const fromNetwork = direction === 'l1-to-l2' ? 'L1 Mainnet' : 'L2 Mainnet';
  const toNetwork = direction === 'l1-to-l2' ? 'L2 Mainnet' : 'L1 Mainnet';
  const fromBalance = direction === 'l1-to-l2' ? selectedToken.l1Balance : selectedToken.l2Balance;

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setResult({ success: false, message: 'Please enter a valid amount' });
      return;
    }

    if (recipient && !isValidAddress(recipient)) {
      setResult({ success: false, message: 'Please enter a valid recipient address' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Simulate bridge operation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setResult({
      success: true,
      message: `Successfully initiated bridge from ${fromNetwork} to ${toNetwork}`,
      txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    });
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        {/* Direction Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setDirection('l1-to-l2')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                direction === 'l1-to-l2'
                  ? 'bg-emerald-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              L1 → L2
            </button>
            <button
              onClick={() => setDirection('l2-to-l1')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                direction === 'l2-to-l1'
                  ? 'bg-emerald-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              L2 → L1
            </button>
          </div>
        </div>

        {/* From Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-400">
              {fromNetwork}
            </span>
          </div>
          <div className="glass rounded-xl p-4">
            {/* Token Selection */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
              <select
                value={selectedToken.symbol}
                onChange={(e) => setSelectedToken(tokens.find(t => t.symbol === e.target.value) || tokens[0])}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol} className="bg-[#0f0f1a]">
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
              <div className="text-right">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-white font-medium">{fromBalance} {selectedToken.symbol}</div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-medium text-white placeholder-gray-600 outline-none"
              />
              <button
                onClick={() => setAmount(fromBalance.toString())}
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="p-2 bg-[#0f0f1a] border border-white/10 rounded-full">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* To Section */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-400">
              {toNetwork}
            </span>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-sm">
                  {selectedToken.icon}
                </div>
                <span className="font-medium text-white">{selectedToken.symbol}</span>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-white font-medium">
                  {direction === 'l1-to-l2' ? selectedToken.l2Balance : selectedToken.l1Balance} {selectedToken.symbol}
                </div>
              </div>
            </div>
            <div className="text-2xl font-medium text-gray-500">
              {amount || '0.0'}
            </div>
          </div>
        </div>

        {/* Recipient (Optional) */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Recipient Address (optional)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x... (defaults to connected wallet)"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 font-mono text-sm"
          />
        </div>

        {/* Bridge Details */}
        <div className="p-4 bg-white/5 rounded-xl mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Bridge Fee</span>
            <span className="text-white">0.001 {selectedToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Estimated Time</span>
            <span className="text-white flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {direction === 'l1-to-l2' ? '~2 minutes' : '~7 days'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Security</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Optimistic Rollup
            </span>
          </div>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={isLoading || !amount}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5" />
              Bridge to {toNetwork}
            </>
          )}
        </button>

        {/* Note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          L2 → L1 withdrawals require a 7-day challenge period for security
        </p>

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
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        result.success ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p className="text-sm text-gray-400">{result.message}</p>
                    {result.txHash && (
                      <a
                        href={`https://explorer.besachain.com/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 hover:text-emerald-300 underline mt-2 inline-block"
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
      </motion.div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { type: 'deposit', from: 'L1', to: 'L2', token: 'BESA', amount: 100, status: 'completed', time: '5 min ago' },
            { type: 'withdraw', from: 'L2', to: 'L1', token: 'ETH', amount: 0.5, status: 'pending', time: '1 hour ago' },
            { type: 'deposit', from: 'L1', to: 'L2', token: 'USDC', amount: 1000, status: 'completed', time: '2 hours ago' },
          ].map((tx, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                }`}>
                  <ArrowRightLeft className={`w-5 h-5 ${
                    tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'
                  }`} />
                </div>
                <div>
                  <div className="text-white font-medium">
                    {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'} {tx.amount} {tx.token}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tx.from} → {tx.to} • {tx.time}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tx.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {tx.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
