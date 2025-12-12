import React from "react";
import { Github, Twitter, Linkedin, Layout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12 w-full border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 mb-6 text-lg tracking-tight select-none">
              <div className="p-1.5 bg-black text-white rounded-lg shadow-sm">
                <Layout size={16} strokeWidth={3} />
              </div>
              PreviewFlow
            </div>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs leading-relaxed">
              Automated preview environments for every pull request. 
              Ship faster with confidence.
            </p>
            <div className="flex gap-3">
              <SocialLink icon={<Github size={18} />} href="https://github.com" />
              <SocialLink icon={<Twitter size={18} />} href="https://twitter.com" />
              <SocialLink icon={<Linkedin size={18} />} href="https://linkedin.com" />
            </div>
          </div>
          
          {/* Links Columns */}
          <FooterColumn title="Product" links={["Features", "Pricing", "Enterprise", "Changelog", "Docs"]} />
          <FooterColumn title="Resources" links={["Community", "Help Center", "Guides", "Contact"]} />
          <FooterColumn title="Legal" links={["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"]} />
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p className="text-neutral-400">© 2024 PreviewFlow Inc. All rights reserved.</p>
          
          <div className="flex gap-8">
             <a href="#" className="text-neutral-400 hover:text-neutral-900 transition-colors">Privacy</a>
             <a href="#" className="text-neutral-400 hover:text-neutral-900 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- SUBCOMPONENTS ---

function SocialLink({ icon, href }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-500 hover:bg-black hover:border-black hover:text-white transition-all duration-200"
    >
      {icon}
    </a>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-semibold text-neutral-900 text-sm tracking-tight">{title}</h4>
      <ul className="flex flex-col gap-3 text-sm text-neutral-500">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="hover:text-black transition-colors duration-200">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}