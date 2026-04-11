import { Navbar } from '@/components/navbar';
import { FaucetForm } from '@/components/faucet-form';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <FaucetForm />
      </div>

      <Footer />
    </main>
  );
}
