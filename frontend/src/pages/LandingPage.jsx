import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { 
  Github, GitPullRequest, Terminal, Globe, Layout, 
  Zap, ArrowRight, Twitter, Linkedin, ShieldCheck, 
  RotateCcw, MessageSquare, BarChart3
} from "lucide-react";
import Navbar from "../components/Navbar.jsx"; 
import { cn } from "../lib/utils.js"; 

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      window.location.href = "http://localhost:4000/auth/github";
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      
      <Navbar />

      <main className="flex flex-col items-center w-full">
        
        {/* --- HERO SECTION --- */}
        <section className="w-full max-w-[1400px] px-6 pt-20 pb-24 md:pt-32 md:pb-32 text-center relative">
          
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-white hover:text-black cursor-pointer shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>PreviewFlow v1.0 is now public</span>
              <ArrowRight size={10} className="text-neutral-400" />
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-neutral-950 mb-8 max-w-5xl mx-auto leading-[0.95] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Deploy pull requests <br className="hidden md:block" />
            <span className="text-neutral-400/80">in seconds.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700">
             Instant preview environments for every PR. Stop waiting for staging. 
             Review code changes in a live URL automatically generated for every commit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 mb-20">
            {/* UPDATED PRIMARY BUTTON */}
            <button 
              onClick={handlePrimaryAction}
              className="h-12 px-8 rounded-full bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
            >
              {isLoggedIn ? <Layout size={18} /> : <Github size={18} />}
              {isLoggedIn ? "Go to Dashboard" : "Start with GitHub"}
            </button>
            
            <button className="h-12 px-8 rounded-full bg-white text-neutral-600 border border-neutral-200 font-medium text-sm hover:bg-neutral-50 hover:text-black transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
              Read Documentation
            </button>
          </div>

          <div className="relative mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-10"></div>
            
            <div className="relative rounded-xl border border-neutral-200/80 bg-[#0a0a0a] shadow-2xl overflow-hidden ring-1 ring-white/10 text-left">
              <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-3 grid grid-cols-3 items-center">
                <div className="flex gap-2 justify-start">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                </div>
                <div className="flex justify-center w-full">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-neutral-400 font-mono shadow-inner">
                    <Globe size={11} />
                    previewflow-pr-123.app
                  </div>
                </div>
                <div className="flex justify-end"></div>
              </div>

              <div className="p-0">
                 <TerminalSimulation />
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="w-full bg-white border-t border-neutral-100 relative z-10">
          <div className="max-w-7xl mx-auto py-24 px-6">
            <div className="mb-20 md:text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-6">Everything needed to ship faster.</h2>
              <p className="text-neutral-500 text-lg leading-relaxed">
                We've obsessed over every detail of the developer experience so you don't have to.
              </p>
            </div>
            <FeaturesSectionWithHoverEffects />
          </div>
        </section>

        {/* --- WORKFLOW STEPS --- */}
        <section className="w-full bg-[#fafafa] py-24 border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-16 text-center tracking-tight">Your new workflow</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-neutral-200 z-0"></div>
              <StepCard number="1" title="Push Code" desc="Create a pull request on GitHub. We automatically detect the change via webhooks." />
              <StepCard number="2" title="Build & Deploy" desc="PreviewFlow spins up a dedicated container, installs deps, and builds your app." />
              <StepCard number="3" title="Preview Live" desc="Get a unique, shareable URL to preview changes. Merge with confidence." />
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="w-full bg-neutral-950 py-24 px-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-neutral-950 to-neutral-950 pointer-events-none"></div>
           
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tighter">Ready to streamline <br/> your deployments?</h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">Join developers shipping code faster with automated previews.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                
                {/* UPDATED CTA BUTTON */}
                <button 
                  onClick={handlePrimaryAction}
                  className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Start for Free"}
                </button>
                
                <button className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-full font-bold text-sm hover:bg-white/5 transition-all">
                  Contact Sales
                </button>
              </div>
           </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-16 pb-12 w-full border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-neutral-900 mb-6 text-lg tracking-tight">
                <div className="p-1.5 bg-black text-white rounded-md">
                  <Layout size={16} />
                </div>
                PreviewFlow
              </div>
              <p className="text-sm text-neutral-500 mb-6 pr-4 leading-relaxed">
                Making deployment preview environments accessible to everyone. Built for modern teams.
              </p>
              <div className="flex gap-4">
                <SocialLink icon={<Github size={18} />} />
                <SocialLink icon={<Twitter size={18} />} />
                <SocialLink icon={<Linkedin size={18} />} />
              </div>
            </div>
            
            <FooterColumn title="Product" links={["Features", "Pricing", "Documentation", "Changelog"]} />
            <FooterColumn title="Resources" links={["Community", "Help Center", "Guides", "API Reference"]} />
            <FooterColumn title="Company" links={["About", "Blog", "Careers", "Contact"]} />
          </div>
          
          <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400 font-medium">
            <p>© 2024 PreviewFlow Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- SUBCOMPONENTS ---

function SocialLink({ icon }) {
  return (
    <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-black hover:text-white transition-all">
      {icon}
    </a>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-bold text-neutral-900 mb-4 text-sm tracking-tight">{title}</h4>
      <ul className="space-y-3 text-sm text-neutral-500">
        {links.map(link => (
          <li key={link}><a href="#" className="hover:text-black transition-colors">{link}</a></li>
        ))}
      </ul>
    </div>
  );
}

function FeaturesSectionWithHoverEffects() {
  const features = [
    { title: "Preview Environments", description: "Automatic deployments for every pull request. Share URLs instantly.", icon: <GitPullRequest className="w-6 h-6" /> },
    { title: "Real-time Logs", description: "Stream build logs via WebSockets directly to your dashboard.", icon: <Terminal className="w-6 h-6" /> },
    { title: "Zero Config", description: "Auto-detects your framework. Just connect your repo and push code.", icon: <Zap className="w-6 h-6" /> },
    { title: "Instant Rollbacks", description: "Revert to a stable version with one click from the dashboard.", icon: <RotateCcw className="w-6 h-6" /> },
    { title: "Global Edge", description: "Deployments are served from the edge for lightning fast access.", icon: <Globe className="w-6 h-6" /> },
    { title: "Team Collaboration", description: "Comment on previews and integrate with Slack for updates.", icon: <MessageSquare className="w-6 h-6" /> },
    { title: "Usage Analytics", description: "Track bandwidth, build minutes, and deployment frequency.", icon: <BarChart3 className="w-6 h-6" /> },
    { title: "Enterprise Security", description: "SSO, RBAC, and audit logs included for enterprise plans.", icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({ title, description, icon, index }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-200 bg-white",
        (index === 0 || index === 4) && "lg:border-l border-neutral-200",
        index < 4 && "lg:border-b border-neutral-200"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 group-hover/feature:bg-black transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

function StepCard({ number, title, desc }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-sm font-bold text-white mb-6 ring-4 ring-neutral-100">
        {number}
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-[250px]">
        {desc}
      </p>
    </div>
  );
}

function TerminalSimulation() {
  const [lines, setLines] = useState([
    { text: "git push origin feature/dashboard", color: "text-white" },
  ]);

  useEffect(() => {
    const sequence = [
      { text: "remote: Resolving deltas: 100% (12/12), completed.", color: "text-neutral-500", delay: 800 },
      { text: "remote: Build triggered for commit a1b2c3d", color: "text-blue-400", delay: 1600 },
      { text: "✓ Building environment...", color: "text-emerald-400", delay: 2400 },
      { text: "✓ Installing dependencies...", color: "text-emerald-400", delay: 3000 },
      { text: "✓ Optimizing assets...", color: "text-emerald-400", delay: 3800 },
      { text: "→ Deployment URL: https://previewflow-pr-123.app", color: "text-blue-400 underline decoration-blue-400/30", delay: 4500 },
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
    <div className="font-mono text-xs md:text-[13px] p-6 space-y-2.5 h-[300px] flex flex-col justify-start text-left font-medium">
      {lines.map((line, i) => (
        <div key={i} className={`${line.color} animate-in fade-in slide-in-from-left-2 duration-300 flex gap-3`}>
          {i === 0 && <span className="text-emerald-500 font-bold">➜</span>}
          <span>{line.text}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-neutral-600 animate-pulse mt-1">
        <span className="text-emerald-500 font-bold">➜</span>
        <span className="w-2.5 h-5 bg-neutral-600"></span>
      </div>
    </div>
  );
}