import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { DocContent } from '@/components/doc-content';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <DocContent />
        </div>
        <Footer />
      </main>
    </div>
  );
}
