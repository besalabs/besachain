'use client';

import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

function EndpointCard({ name, url, chainId }: { name: string; url: string; chainId: number }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900">{name}</span>
        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
          Chain ID: {chainId}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">{url}</code>
        <button
          onClick={copyUrl}
          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ContractTable({ contracts }: { contracts: { name: string; address: string; description: string }[] }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">Contract</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">Address</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">Description</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.name} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900 border border-slate-200">{contract.name}</td>
              <td className="px-4 py-3 text-sm font-mono text-slate-600 border border-slate-200">
                <code className="bg-slate-100 px-2 py-1 rounded">{contract.address}</code>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">{contract.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocContent() {
  return (
    <div className="prose prose-slate max-w-none">
      {/* Introduction */}
      <section id="introduction">
        <h1>BesaChain Documentation</h1>
        <p className="text-lg text-slate-600">
          Welcome to the BesaChain documentation. BesaChain is a post-quantum EVM blockchain 
          featuring 450ms finality, 10,500+ TPS on L1, and native ML-DSA signature support.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 my-8">
          <div className="p-6 bg-white border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-emerald-600 font-bold text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Fast Finality</h3>
            <p className="text-sm text-slate-600">450ms block finality with deterministic confirmation</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-cyan-600 font-bold text-lg">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Quantum Safe</h3>
            <p className="text-sm text-slate-600">Native ML-DSA NIST FIPS 204 compliant signatures</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-violet-600 font-bold text-lg">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">High TPS</h3>
            <p className="text-sm text-slate-600">10,500+ TPS on L1, 200,000+ TPS on L2</p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start">
        <h2>Quick Start</h2>
        <p>Get started with BesaChain in minutes. Connect your wallet and start building.</p>
        
        <h3>1. Add BesaChain to MetaMask</h3>
        <CodeBlock
          code={`Network Name: BesaChain L1
RPC URL: https://rpc.besachain.com
Chain ID: 1444
Currency Symbol: BESA
Block Explorer: https://explorer.besachain.com`}
        />

        <h3>2. Install Dependencies</h3>
        <CodeBlock
          language="bash"
          code={`npm install ethers @besachain/sdk
# or
yarn add ethers @besachain/sdk`}
        />

        <h3>3. Connect to BesaChain</h3>
        <CodeBlock
          language="javascript"
          code={`import { ethers } from 'ethers';

// Connect to BesaChain L1
const provider = new ethers.JsonRpcProvider('https://rpc.besachain.com');

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);`}
        />
      </section>

      {/* Network Info */}
      <section id="network-info">
        <h2>Network Information</h2>
        
        <h3>Chain IDs</h3>
        <table>
          <thead>
            <tr>
              <th>Network</th>
              <th>Chain ID</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BesaChain L1</td>
              <td><code>1444</code></td>
              <td>Mainnet</td>
            </tr>
            <tr>
              <td>BesaChain L2</td>
              <td><code>1445</code></td>
              <td>Mainnet</td>
            </tr>
            <tr>
              <td>BesaChain Testnet</td>
              <td><code>14440</code></td>
              <td>Testnet</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* RPC Endpoints */}
      <section id="rpc">
        <h2>RPC Endpoints</h2>
        
        <h3 id="l1-mainnet">L1 Mainnet</h3>
        <div className="grid gap-4 my-6">
          <EndpointCard
            name="HTTPS RPC"
            url="https://rpc.besachain.com"
            chainId={1444}
          />
          <EndpointCard
            name="WebSocket"
            url="wss://ws.besachain.com"
            chainId={1444}
          />
        </div>

        <h3 id="l2-mainnet">L2 Mainnet</h3>
        <div className="grid gap-4 my-6">
          <EndpointCard
            name="HTTPS RPC"
            url="https://l2-rpc.besachain.com"
            chainId={1445}
          />
          <EndpointCard
            name="WebSocket"
            url="wss://l2-ws.besachain.com"
            chainId={1445}
          />
        </div>

        <h3 id="testnet">Testnet</h3>
        <div className="grid gap-4 my-6">
          <EndpointCard
            name="HTTPS RPC"
            url="https://testnet-rpc.besachain.com"
            chainId={14440}
          />
        </div>

        <h3 id="rate-limits">Rate Limits</h3>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Requests/min</th>
              <th>Requests/day</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Free</td>
              <td>100</td>
              <td>10,000</td>
            </tr>
            <tr>
              <td>Developer</td>
              <td>1,000</td>
              <td>100,000</td>
            </tr>
            <tr>
              <td>Enterprise</td>
              <td>10,000</td>
              <td>Unlimited</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Smart Contracts */}
      <section id="contracts">
        <h2>Smart Contracts</h2>
        
        <h3 id="deployed">Deployed Contracts (L1)</h3>
        <ContractTable
          contracts={[
            { name: 'BESA Token', address: '0x000...0001', description: 'Native BESA token contract' },
            { name: 'BesaSwap Factory', address: '0x000...0002', description: 'DEX factory contract' },
            { name: 'BesaSwap Router', address: '0x000...0003', description: 'DEX router for swaps' },
            { name: 'Bridge (L1)', address: '0x000...0004', description: 'L1 bridge contract' },
            { name: 'Staking', address: '0x000...0005', description: 'BESA staking contract' },
          ]}
        />

        <h3 id="verified">Verified Contracts</h3>
        <p>
          All BesaChain core contracts are verified on the{' '}
          <a href="https://explorer.besachain.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
            Block Explorer <ExternalLink className="w-3 h-3" />
          </a>.
          Source code is available on{' '}
          <a href="https://github.com/besalabs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
            GitHub <ExternalLink className="w-3 h-3" />
          </a>.
        </p>
      </section>

      {/* API Reference */}
      <section id="api">
        <h2>API Reference</h2>
        
        <h3 id="json-rpc">JSON-RPC Methods</h3>
        <p>BesaChain supports all standard Ethereum JSON-RPC methods with some additional BesaChain-specific methods.</p>
        
        <h4>Standard Methods</h4>
        <ul>
          <li><code>eth_blockNumber</code> - Returns the current block number</li>
          <li><code>eth_getBalance</code> - Returns the balance of an address</li>
          <li><code>eth_sendTransaction</code> - Sends a transaction</li>
          <li><code>eth_call</code> - Executes a message call</li>
          <li><code>eth_estimateGas</code> - Estimates gas for a transaction</li>
        </ul>

        <h4>BesaChain-Specific Methods</h4>
        <ul>
          <li><code>besa_getMLDSASignature</code> - Generate ML-DSA signature</li>
          <li><code>besa_getFinalityStatus</code> - Get block finality status</li>
          <li><code>besa_getChainStats</code> - Get chain statistics</li>
        </ul>

        <h3 id="sdk">SDK</h3>
        <p>Install the BesaChain SDK for easier integration:</p>
        <CodeBlock
          language="bash"
          code={`npm install @besachain/sdk`}
        />
        <CodeBlock
          language="javascript"
          code={`import { BesaChainSDK } from '@besachain/sdk';

const sdk = new BesaChainSDK({
  network: 'mainnet', // or 'testnet'
  apiKey: 'your-api-key'
});

// Get account balance
const balance = await sdk.getBalance('0x...');`}
        />
      </section>

      {/* ML-DSA */}
      <section id="ml-dsa">
        <h2>ML-DSA Signatures</h2>
        <p>
          BesaChain natively supports ML-DSA (Module Lattice-based Digital Signature Algorithm) 
          as specified in NIST FIPS 204. This provides post-quantum security for your transactions.
        </p>
        
        <h3>Using ML-DSA</h3>
        <CodeBlock
          language="javascript"
          code={`// Generate ML-DSA keypair
const keypair = await sdk.mlDSA.generateKeypair();

// Sign a message
const signature = await sdk.mlDSA.sign(keypair.privateKey, message);

// Verify signature
const isValid = await sdk.mlDSA.verify(keypair.publicKey, message, signature);`}
        />
      </section>

      {/* BESA Token */}
      <section id="besa-token">
        <h2>BESA Token</h2>
        
        <h3>Tokenomics</h3>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Supply</td>
              <td>1,000,000,000 BESA</td>
            </tr>
            <tr>
              <td>Initial Circulation</td>
              <td>150,000,000 BESA (15%)</td>
            </tr>
            <tr>
              <td>Inflation Rate</td>
              <td>3% per year</td>
            </tr>
            <tr>
              <td>Decimals</td>
              <td>18</td>
            </tr>
          </tbody>
        </table>

        <h3>Token Utility</h3>
        <ul>
          <li><strong>Transaction Fees:</strong> Pay for gas on BesaChain</li>
          <li><strong>Staking:</strong> Stake BESA to earn rewards and secure the network</li>
          <li><strong>Governance:</strong> Vote on protocol upgrades and parameter changes</li>
          <li><strong>DEX Trading:</strong> Trade BESA on BesaSwap</li>
        </ul>
      </section>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/besalabs/docs/edit/main"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-emerald-600 inline-flex items-center gap-1"
            >
              Edit this page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
