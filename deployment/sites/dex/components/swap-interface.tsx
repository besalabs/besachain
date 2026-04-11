'use client';

import { useState } from 'react';
import { ArrowDown, Settings, RefreshCw, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tokens = [
  { symbol: 'BESA', name: 'BesaChain', balance: 1250.5, price: 2.45, icon: 'B' },
  { symbol: 'WBTC', name: 'Wrapped BTC', balance: 0.05, price: 67500, icon: '₿' },
  { symbol: 'WETH', name: 'Wrapped ETH', balance: 1.2, price: 3450, icon: 'Ξ' },
  { symbol: 'USDC', name: 'USD Coin', balance: 5000, price: 1, icon: '$' },
  { symbol: 'USDT', name: 'Tether', balance: 3200, price: 1, icon: '₮' },
];

export function SwapInterface() {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[3]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Simple mock calculation
    if (value && !isNaN(Number(value))) {
      const rate = fromToken.price / toToken.price;
      const estimated = Number(value) * rate * 0.997; // 0.3% fee
      setToAmount(estimated.toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSwapping(false);
    setFromAmount('');
    setToAmount('');
    alert('Swap simulated successfully!');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 p-4 bg-[#0f0f1a] border border-white/10 rounded-xl z-10"
                >
                  <div className="text-sm font-medium text-white mb-3">Slippage Tolerance</div>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                          slippage === value
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* From Token */}
        <div className="glass rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-500">
              Balance: {fromToken.balance.toLocaleString()} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-sm">
                  {fromToken.icon}
                </div>
                <span className="font-medium text-white">{fromToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {showFromDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-56 py-2 bg-[#0f0f1a] border border-white/10 rounded-xl z-20"
                  >
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => {
                          setFromToken(token);
                          setShowFromDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-sm">
                          {token.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-500">{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl font-medium text-white placeholder-gray-600 outline-none"
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-sm text-gray-500">
              ≈ ${fromAmount ? (Number(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-3 bg-[#0f0f1a] border border-white/10 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
          >
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="glass rounded-xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-500">
              Balance: {toToken.balance.toLocaleString()} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-sm">
                  {toToken.icon}
                </div>
                <span className="font-medium text-white">{toToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {showToDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-56 py-2 bg-[#0f0f1a] border border-white/10 rounded-xl z-20"
                  >
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => {
                          setToToken(token);
                          setShowToDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-sm">
                          {token.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-500">{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl font-medium text-white placeholder-gray-600 outline-none"
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-sm text-gray-500">
              ≈ ${toAmount ? (Number(toAmount) * toToken.price).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Swap Details */}
        {fromAmount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-white/5 rounded-xl"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Fee (0.3%)</span>
              <span className="text-white">
                {(Number(fromAmount) * 0.003).toFixed(6)} {fromToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!fromAmount || isSwapping}
          className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Swapping...
            </>
          ) : (
            'Swap'
          )}
        </button>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
          <Info className="w-4 h-4" />
          <span>Always verify the token contract before swapping</span>
        </div>
      </div>
    </div>
  );
}
