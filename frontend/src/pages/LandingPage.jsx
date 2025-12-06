import React, { useState, useEffect } from "react";
import { 
  Github, GitPullRequest, Terminal, Globe, Layout, 
  ShieldCheck, Zap, ArrowRight, Twitter, Linkedin
} from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      
      {/* 1. NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="p-1 bg-black text-white rounded-md">
              <Layout size={16} />
            </div>
            PreviewFlow
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors hidden sm:block">Features</a>
            <a href="#" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors hidden sm:block">Pricing</a>
            <button 
              onClick={handleLogin}
              className="text-sm font-semibold px-4 py-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
            >
              Log In
            </button>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center w-full">
        
        {/* 2. HERO SECTION */}
        <section className="w-full max-w-7xl px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center relative overflow-hidden">
          {/* Subtle Grid & Gradients */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute top-0 left-[-10%] w-[40%] h-[60%] bg-blue-50/50 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="absolute bottom-0 right-[-10%] w-[40%] h-[60%] bg-purple-50/50 rounded-full blur-3xl -z-10 opacity-60"></div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-neutral-950 mb-6 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Deploy pull requests <br className="hidden md:block" />
            <span className="text-neutral-400">in seconds.</span>
          </h1>

          <p className="text-base md:text-xl text-neutral-500 max-w-2xl mx-auto mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Instant preview environments for every PR. Stop waiting for staging. 
            Review code changes in a live URL automatically generated for every commit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-700 mb-16">
            <button 
              onClick={handleLogin}
              className="h-11 px-8 rounded-full bg-black text-white font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Github size={18} />
              Start with GitHub
            </button>
            <button className="h-11 px-8 rounded-full bg-white text-neutral-900 border border-neutral-200 font-semibold text-sm hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm">
              Read Documentation
            </button>
          </div>

          {/* Hero Visual - Pulled up closer to content */}
          <div className="relative mx-auto max-w-5xl animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden ring-1 ring-neutral-950/5">
              <div className="bg-neutral-50 border-b border-neutral-100 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300"></div>
                </div>
                <div className="ml-4 px-2 py-0.5 rounded bg-white border border-neutral-200 text-[10px] text-neutral-500 font-mono flex items-center gap-2 shadow-sm">
                  <Globe size={10} />
                  previewflow-pr-123.app
                </div>
              </div>
              <div className="p-0 bg-white">
                 <TerminalSimulation />
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES GRID - Reduced whitespace */}
        <section className="w-full bg-neutral-50 border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="mb-12 md:text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">Everything needed to ship faster.</h2>
              <p className="text-neutral-500 text-lg">Remove the bottleneck of staging environments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<GitPullRequest className="text-neutral-900" />}
                title="Preview Environments"
                desc="Automatic deployments for every pull request. Share URLs with your team instantly."
              />
              <FeatureCard 
                icon={<Terminal className="text-neutral-900" />}
                title="Real-time Logs"
                desc="Stream build logs via WebSockets directly to your dashboard. Debug in real-time."
              />
              <FeatureCard 
                icon={<Zap className="text-neutral-900" />}
                title="Zero Config"
                desc="We auto-detect your framework and settings. Just connect your repo and push code."
              />
            </div>
          </div>
        </section>

        {/* 4. WORKFLOW SECTION */}
        <section className="w-full bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Your new workflow</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-neutral-100 z-0"></div>

              <StepCard 
                number="01"
                title="Push Code"
                desc="Create a pull request on GitHub. We automatically detect the change."
              />
              <StepCard 
                number="02"
                title="Build & Deploy"
                desc="PreviewFlow spins up a dedicated container and builds your application."
              />
              <StepCard 
                number="03"
                title="Preview Live"
                desc="Get a unique URL to preview changes. Merge with confidence."
              />
            </div>
          </div>
        </section>

        {/* 5. CTA SECTION */}
        <section className="w-full bg-black py-20 px-6 border-t border-white/10 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/30 via-black to-black pointer-events-none"></div>
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Ready to streamline your deployment?</h2>
              <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">Join developers shipping code faster with automated previews.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleLogin}
                  className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm hover:bg-neutral-200 transition-all shadow-xl hover:scale-105"
                >
                  Start for Free
                </button>
                <button className="px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-all">
                  Contact Sales
                </button>
              </div>
           </div>
        </section>

      </main>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-neutral-100 pt-12 pb-8 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-neutral-900 mb-4">
                <div className="p-1 bg-black text-white rounded">
                  <Layout size={14} />
                </div>
                PreviewFlow
              </div>
              <p className="text-sm text-neutral-500 mb-4 pr-4">
                Making deployment preview environments accessible to everyone.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-neutral-400 hover:text-black transition-colors"><Github size={20} /></a>
                <a href="#" className="text-neutral-400 hover:text-black transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-neutral-400 hover:text-black transition-colors"><Linkedin size={20} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-black">Features</a></li>
                <li><a href="#" className="hover:text-black">Pricing</a></li>
                <li><a href="#" className="hover:text-black">Documentation</a></li>
                <li><a href="#" className="hover:text-black">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-black">Community</a></li>
                <li><a href="#" className="hover:text-black">Help Center</a></li>
                <li><a href="#" className="hover:text-black">Guides</a></li>
                <li><a href="#" className="hover:text-black">API Reference</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Blog</a></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
            <p>© 2024 PreviewFlow Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black">Privacy Policy</a>
              <a href="#" className="hover:text-black">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- SUBCOMPONENTS ---

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300">
      <div className="w-10 h-10 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center mb-4 text-neutral-900">
        {icon}
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-lg font-bold text-white mb-4">
        {number}
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
        {desc}
      </p>
    </div>
  );
}

function TerminalSimulation() {
  const [lines, setLines] = useState([
    { text: "git push origin feature/dashboard", color: "text-neutral-800" },
  ]);

  useEffect(() => {
    const sequence = [
      { text: "remote: Resolving deltas: 100% (12/12), completed.", color: "text-neutral-400", delay: 800 },
      { text: "remote: Build triggered for commit a1b2c3d", color: "text-blue-600", delay: 1600 },
      { text: "✓ Building environment...", color: "text-neutral-500", delay: 2400 },
      { text: "✓ Installing dependencies...", color: "text-neutral-500", delay: 3000 },
      { text: "✓ Optimizing assets...", color: "text-neutral-500", delay: 3800 },
      { text: "→ Deployment URL: https://previewflow-pr-123.app", color: "text-green-600 font-bold", delay: 4500 },
    ];

    let timeouts = [];
    sequence.forEach((item) => {
      timeouts.push(setTimeout(() => {
        setLines(prev => [...prev, item]);
      }, item.delay));
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="font-mono text-xs md:text-sm p-6 space-y-2 h-[240px] flex flex-col justify-end">
      {lines.map((line, i) => (
        <div key={i} className={`${line.color} animate-in fade-in slide-in-from-left-2 duration-300`}>
          {i === 0 && <span className="text-green-600 mr-2">➜</span>}
          {line.text}
        </div>
      ))}
      <div className="flex items-center gap-2 text-neutral-400 animate-pulse">
        <span className="text-green-600">➜</span>
        <span className="w-2 h-4 bg-neutral-400"></span>
      </div>
    </div>
  );
}