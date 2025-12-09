import React, { useState } from "react";
import { Check, X, Zap, Crown, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx"; 
import { AnimatedCounter } from "../components/ui/animated-counter.jsx"; 

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      
      <Navbar />

      <main className="w-full relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-32 pb-20 px-6 text-center max-w-7xl mx-auto relative">
           {/* Background Pattern */}
           <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-950 mb-6 mx-auto leading-[0.95] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-500 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Start for free, scale as you grow. No hidden fees. <br className="hidden md:block"/>
            Upgrade at any time to unlock higher limits.
          </p>

          {/* Animated Billing Toggle */}
          <div className="flex justify-center mb-20 animate-in fade-in zoom-in-95 duration-700 delay-200">
            <div className="bg-neutral-100 p-1 rounded-full relative inline-flex items-center">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className="relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-200"
              >
                <span className={billingCycle === "monthly" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}>Monthly</span>
                {billingCycle === "monthly" && (
                  <motion.div layoutId="pill" className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className="relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
              >
                <span className={billingCycle === "yearly" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}>Yearly</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Save 20%</span>
                {billingCycle === "yearly" && (
                  <motion.div layoutId="pill" className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* --- PRICING CARDS --- */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PricingCard 
              title="Free"
              price={0} 
              period="/mo"
              description="For hobbyists and side projects."
              features={["1 Active Project", "1 Concurrent Build", "7-day Log Retention", "Community Support"]}
              cta="Start for Free"
              delay={0}
            />
            <PricingCard 
              title="Hobby"
              price={billingCycle === "monthly" ? 15 : 12}
              period={billingCycle === "monthly" ? "/mo" : "/mo, billed yearly"}
              description="For serious developers building apps."
              features={["2 Active Projects", "1 Concurrent Build", "30-day Log Retention", "Email Support"]}
              cta="Upgrade to Hobby"
              delay={0.1}
            />
            <PricingCard 
              title="Pro"
              price={billingCycle === "monthly" ? 49 : 39}
              period={billingCycle === "monthly" ? "/mo" : "/mo, billed yearly"}
              description="For teams shipping daily."
              features={["Unlimited Projects", "3 Concurrent Builds", "Live Websocket Logs", "Priority Support", "90-day Log Retention"]}
              cta="Upgrade to Pro"
              highlight
              ctaStyle="black"
              icon={<Zap size={18} className="text-white fill-current" />}
              delay={0.2}
            />
            <PricingCard 
              title="Enterprise"
              price="Custom"
              isCustomPrice 
              description="For organizations with advanced needs."
              features={["Unlimited Projects", "10+ Concurrent Builds", "SSO & SAML", "Dedicated Success Manager", "Custom SLA"]}
              cta="Contact Sales"
              icon={<Crown size={18} className="text-neutral-900" />}
              delay={0.3}
            />
          </div>
        </section>

        {/* --- COMPARISON TABLE --- */}
        <section className="border-t border-neutral-100 bg-[#fafafa]/50 py-24">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-16 text-center tracking-tight text-neutral-900">Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="pb-6 px-6 text-xs font-bold text-neutral-400 uppercase tracking-wider w-1/3">Features</th>
                    <th className="pb-6 px-6 text-sm font-bold text-neutral-900 text-center w-1/6">Free</th>
                    <th className="pb-6 px-6 text-sm font-bold text-neutral-900 text-center w-1/6">Hobby</th>
                    <th className="pb-6 px-6 text-sm font-bold text-blue-600 text-center w-1/6">Pro</th>
                    <th className="pb-6 px-6 text-sm font-bold text-neutral-900 text-center w-1/6">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <TableRow label="Concurrent Builds" free="1" hobby="1" pro="3" ent="10+" />
                  <TableRow label="Active Projects" free="1" hobby="2" pro="Unlimited" ent="Unlimited" />
                  <TableRow label="Live Logs (WebSockets)" free={false} hobby={false} pro={true} ent={true} />
                  <TableRow label="Deployment History" free="7 Days" hobby="30 Days" pro="90 Days" ent="Unlimited" />
                  <TableRow label="Custom Domains" free={false} hobby={true} pro={true} ent={true} />
                  <TableRow label="SSO / SAML" free={false} hobby={false} pro={false} ent={true} />
                  <TableRow label="SLA" free={false} hobby={false} pro={false} ent="99.99%" />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="bg-white py-24 px-6 border-t border-neutral-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
            <div className="grid gap-6">
               <FAQItem q="Can I switch plans later?" a="Yes, you can upgrade or downgrade your plan at any time from your dashboard settings. Prorated charges will be applied automatically." />
               <FAQItem q="What happens if I downgrade?" a="If you have more projects than your new plan allows, you will be asked to archive some before the downgrade takes effect. Your logs will retain the retention policy of the new plan." />
               <FAQItem q="Do you offer open source discounts?" a="Yes! We support the community. Contact our team with a link to your active repository and we'll set you up with a free Pro plan." />
               <FAQItem q="How are concurrent builds calculated?" a="Concurrent builds refer to the number of builds that can run at the exact same time. If you trigger more builds than your limit, they will be queued and processed as soon as a slot opens up." />
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-neutral-100 py-12 text-center">
        <p className="text-sm text-neutral-400 font-medium">© 2024 PreviewFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function PricingCard({ title, price, period, description, features, cta, ctaStyle, highlight, icon, isCustomPrice, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`p-8 rounded-3xl flex flex-col h-full transition-all duration-300 relative group
        ${highlight 
          ? 'bg-white border-2 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.1)]' 
          : 'bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1'
        }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
           {icon && <div className={`p-1.5 rounded-md ${highlight ? 'bg-blue-600' : 'bg-neutral-100 text-neutral-600'}`}>{icon}</div>}
           <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-neutral-500 font-medium leading-relaxed min-h-[40px]">{description}</p>
      </div>

      <div className="mb-8 flex items-baseline">
        {isCustomPrice ? (
            <span className="text-4xl font-bold text-neutral-900 tracking-tighter">{price}</span>
        ) : (
            <div className="flex items-baseline tracking-tighter">
                <span className="text-2xl font-bold text-neutral-500 mr-0.5">$</span>
                <span className="text-5xl font-bold text-neutral-900">
                   <AnimatedCounter value={price} />
                </span>
            </div>
        )}
        {period && <span className="text-neutral-400 text-sm font-medium ml-1.5">{period}</span>}
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {features.map((feat, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-neutral-600 font-medium">
              <Check size={16} className={`mt-0.5 shrink-0 ${highlight ? 'text-blue-600' : 'text-neutral-400'}`} />
              <span className="leading-tight">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className={`w-full py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2
        ${ctaStyle === 'black' 
          ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md hover:shadow-lg active:scale-95' 
          : 'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-900 shadow-sm active:scale-95'
        }`}>
        {cta}
        {highlight && <ArrowRight size={14} />}
      </button>
    </motion.div>
  );
}

function TableRow({ label, free, hobby, pro, ent }) {
  const renderCell = (value) => {
    if (value === true) return <Check size={18} className="text-neutral-900 mx-auto" />;
    if (value === false) return <div className="w-1.5 h-1.5 bg-neutral-200 rounded-full mx-auto" />;
    return <span className="text-neutral-900 font-medium">{value}</span>;
  };

  return (
    <tr className="border-b border-neutral-100 group hover:bg-white transition-colors">
      <td className="py-5 px-6 font-medium text-neutral-600">{label}</td>
      <td className="py-5 px-6 text-center">{renderCell(free)}</td>
      <td className="py-5 px-6 text-center">{renderCell(hobby)}</td>
      <td className="py-5 px-6 text-center bg-blue-50/10 group-hover:bg-blue-50/30 transition-colors">
        {/* FIX: Changed 'value' to 'pro' here */}
        {pro === true ? <Check size={18} className="text-blue-600 mx-auto" /> : renderCell(pro)}
      </td>
      <td className="py-5 px-6 text-center">{renderCell(ent)}</td>
    </tr>
  );
}

function FAQItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      onClick={() => setIsOpen(!isOpen)} 
      className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-neutral-900 text-base">{q}</h4>
        <div className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
           <ArrowRight size={18} className="group-hover:text-neutral-900" />
        </div>
      </div>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'}`}>
        <p className="text-neutral-500 text-sm leading-relaxed overflow-hidden">
          {a}
        </p>
      </div>
    </div>
  );
}