import { Navbar } from "@/components/navbar-new";
import { Hero } from "@/components/hero-new";
import { NetworkStats } from "@/components/network-stats-new";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050507]">
      <Navbar />
      <Hero />
      <NetworkStats />
      
      {/* Technology Section */}
      <section id="technology" className="py-24 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Post-Quantum Architecture
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built for the quantum era. ML-DSA signatures, optimized EVM, and dual-layer scaling.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'ML-DSA Precompile',
                description: 'NIST FIPS 204 compliant quantum-safe signatures natively supported in the EVM.',
                stat: 'Level 5',
                label: 'NIST Security'
              },
              {
                title: '450ms Finality',
                description: 'Sub-second block confirmation with deterministic finality on L1.',
                stat: '10,500+',
                label: 'Transactions/sec'
              },
              {
                title: 'Dual-Layer Scaling',
                description: 'L1 for security, L2 for throughput. Optimistic rollup architecture.',
                stat: '200,000+',
                label: 'L2 TPS'
              }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-900/50 border border-white/10 hover:border-emerald-500/30 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 mb-6 text-sm">{item.description}</p>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-2xl font-bold text-emerald-400">{item.stat}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-24 bg-gradient-to-b from-[#050507] to-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Build on BesaChain
              </h2>
              <p className="text-gray-400 mb-8">
                Full EVM compatibility means your existing Solidity contracts work out of the box. 
                Deploy with standard tools like Hardhat, Foundry, or Remix.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Standard JSON-RPC API',
                  'Ethereum-compatible tooling',
                  'Native ML-DSA precompile',
                  'Low gas fees (~0.05 Gwei)'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://docs.besachain.com"
                  className="px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                  Read Docs
                </a>
                <a 
                  href="https://github.com/besalabs"
                  className="px-6 py-3 border border-gray-700 text-white rounded-lg hover:border-gray-500 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900/80 border border-white/10 p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <span className="ml-2 text-gray-500">deploy.js</span>
              </div>
              <pre className="text-gray-400 overflow-x-auto">
{`// Deploy to BesaChain L1 (Chain 1444)
const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("MyContract");
  
  // Deploy with quantum-safe account
  const contract = await Contract.deploy();
  
  await contract.waitForDeployment();
  
  console.log(
    \`Deployed to \${await contract.getAddress()}\`
  );
}

main().catch(console.error);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
