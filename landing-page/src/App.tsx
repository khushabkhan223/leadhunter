import React, { useEffect, useRef, useState } from 'react';
import { MailX, Users, MessageSquare, Search, Bot, Zap, Crosshair, ArrowRight, Activity, Globe, Compass, ChevronRight, Award } from 'lucide-react';

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, className: `fade-in ${isVisible ? 'visible' : ''} transition-all duration-1000 ease-out` };
}

function Section({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const fade = useFadeIn();
  return (
    <div ref={fade.ref} className={`${fade.className} ${className} w-full max-w-[1280px] mx-auto px-6`}>
      {children}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="w-full max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center">
          <Search className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">LeadHunter</span>
      </div>
      <a href="https://leadhunter1.onrender.com" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full bg-gradient-to-r from-accent1 to-accent2 text-white text-sm font-semibold transition-all hover:scale-105 shadow-[0_0_20px_rgba(108,99,255,0.3)]">
        Try Demo
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <Section className="pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16 relative">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent1/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex-1 text-center lg:text-left z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-xs font-medium text-textMuted">AI-Powered Intent Discovery</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
          Find high-intent leads <br className="hidden lg:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">
            before your competitors.
          </span>
        </h1>
        <p className="text-lg lg:text-xl text-textMuted mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          LeadHunter scans online conversations, communities and forums to find people actively looking for products like yours.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
          <a href="https://leadhunter1.onrender.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full bg-gradient-to-r from-accent1 to-accent2 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(108,99,255,0.4)]">
            Try Demo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent1/20 to-accent2/20 blur-[80px] -z-10 rounded-full"></div>
        <div className="bg-card border border-white/10 p-6 rounded-xl shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-4 text-xs font-medium text-textMuted flex items-center gap-2">
              <Bot className="w-3 h-3" /> Live Discovery Engine
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-textMuted mb-1">Target Persona</p>
              <p className="text-sm text-white">Find companies complaining about slow CRM tools</p>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Detected Signals</span>
                <span className="text-xs text-secondary flex items-center gap-1"><Activity className="w-3 h-3"/> Active</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-accent1/10 to-transparent p-3 rounded-lg border-l-2 border-secondary hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">Acme Corp CTO</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-secondary/20 text-secondary">Score: 9.4</span>
                  </div>
                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                    "We're spending more time waiting for Salesforce to load than actually selling. Anyone recommend a faster alternative?"
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">TechFlow Sales Lead</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-accent1/20 text-accent1">Score: 8.1</span>
                  </div>
                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                    "Our current CRM is totally bloated. Trying to export a simple list breaks the instance."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Problem() {
  const cards = [
    { icon: <MailX className="w-6 h-6 text-red-400" />, title: "Cold Outreach", desc: "Sending hundreds of emails with sub-1% response rates because of zero context." },
    { icon: <Users className="w-6 h-6 text-yellow-400" />, title: "Generic Lead Lists", desc: "Buying databases of outdated contacts who have no buying intent right now." },
    { icon: <MessageSquare className="w-6 h-6 text-blue-400" />, title: "Missing Real Pain", desc: "Ignoring thousands of public conversations where demand already exists." }
  ];

  return (
    <Section className="py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Most founders search for customers in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">wrong places.</span></h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-card border border-white/5 p-8 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {c.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{c.title}</h3>
            <p className="text-textMuted leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  return (
    <div className="py-32 bg-card/50 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <Section>
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">How LeadHunter Works</h2>
          <p className="text-textMuted max-w-2xl mx-auto">From description to qualified conversations in minutes.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
          <div className="hidden md:block absolute top-[40px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
          
          {[
            { step: '1', title: 'Describe Customer', desc: 'Detail your product and who you compete against.' },
            { step: '2', title: 'AI Scanning', desc: 'LeadHunter scans communities, filtering out noise.' },
            { step: '3', title: 'Verified Leads', desc: 'Receive high-intent targets with personalized outreach drafts.' }
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center group cursor-pointer">
              <div className="w-20 h-20 mx-auto rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 text-2xl font-bold text-white group-hover:border-accent1 group-hover:text-accent1 transition-all group-hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] shadow-xl relative z-10">
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-textMuted max-w-[240px] mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ProductPreview() {
  return (
    <Section className="py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white">See the signal through the noise.</h2>
      </div>
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute inset-0 bg-gradient-to-b from-accent1/20 to-transparent blur-[100px] -z-10 rounded-[3xl]"></div>
        <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="border-b border-white/5 bg-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="text-sm font-medium text-white border-b-2 border-accent1 pb-4 -mb-4">Discovered Leads (12)</div>
              <div className="text-sm font-medium text-textMuted pb-4 -mb-4 cursor-pointer hover:text-white transition-colors">Saved Searches</div>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-secondary"></span>
               <span className="text-xs text-textMuted">Pipeline Active</span>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              {/* Simulated Card 1 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <b className="font-serif">Y</b>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Hacker News Discussion</h4>
                      <p className="text-xs text-textMuted text-orange-300/80">news.ycombinator.com</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">9.2 SCORE</span>
                  </div>
                </div>
                <div className="bg-[#050510] rounded-lg p-3 text-sm text-gray-300 italic mb-4 border border-white/5">
                  "Is it just me or has Vercel's pricing become completely unpredictable? Looking for a simpler hosting alternative that doesn't penalize traffic spikes."
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300 whitespace-nowrap">Pain: Unpredictable Pricing</span>
                  <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300 whitespace-nowrap">Intent: High (Evaluating)</span>
                </div>
                <button className="text-sm text-accent1 font-medium hover:text-white transition-colors flex items-center gap-1">
                  View Suggested Outreach <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Card 2 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all opacity-70">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Webflow Community</h4>
                      <p className="text-xs text-textMuted text-blue-300/80">forum.webflow.com</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-1 rounded bg-accent1/10 text-accent1 text-xs font-bold border border-accent1/20">7.8 SCORE</span>
                  </div>
                </div>
                <div className="bg-[#050510] rounded-lg p-3 text-sm text-gray-300 italic border border-white/5">
                  "Hitting limits on CMS items again. It's getting too expensive to run our magazine site here."
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                 <h5 className="text-sm font-semibold text-white mb-4">Pipeline Status</h5>
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 text-sm">
                     <span className="text-secondary"><Crosshair className="w-4 h-4"/></span>
                     <span className="text-gray-300 flex-1">Stage 1: Search</span>
                     <span className="text-textMuted">Done</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <span className="text-secondary"><Globe className="w-4 h-4"/></span>
                     <span className="text-gray-300 flex-1">Stage 2: Discover</span>
                     <span className="text-textMuted">Done</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <span className="text-secondary"><Activity className="w-4 h-4"/></span>
                     <span className="text-gray-300 flex-1">Stage 3: Filter</span>
                     <span className="text-textMuted">Done</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm animate-pulse">
                     <span className="text-accent1"><Bot className="w-4 h-4"/></span>
                     <span className="text-white font-medium flex-1">Stage 4: Enrich</span>
                     <span className="text-accent1">Running</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Features() {
  const feats = [
    { icon: <Compass className="w-6 h-6"/>, title: "Intent Discovery", desc: "Don't just find emails. Find the exact moments people express a need for your solution." },
    { icon: <Globe className="w-6 h-6"/>, title: "Cross-Platform Scanning", desc: "Monitors Reddit, Hacker News, Stack Overflow, and niche forums concurrently." },
    { icon: <Award className="w-6 h-6"/>, title: "Smart Scoring", desc: "AI ranks discussions based on frustration level and buying intent, so you focus on the hottest leads." },
    { icon: <Zap className="w-6 h-6"/>, title: "Drafted Outreach", desc: "Automatically generates a personalized opening message referencing their specific complaint." }
  ];

  return (
    <Section className="py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Powered by Advanced AI Models</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {feats.map((f, i) => (
          <div key={i} className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-all hover:shadow-[0_0_30px_rgba(108,99,255,0.1)] group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent1/20 to-accent2/20 flex items-center justify-center mb-6 text-accent2 group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
            <p className="text-textMuted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DemoLead() {
  return (
    <Section className="py-24">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">See a real lead in action.</h2>
        <p className="text-textMuted leading-relaxed">LeadHunter extracts the exact context needed to turn a cold email into a helpful reply.</p>
      </div>
      
      <div className="max-w-2xl mx-auto bg-card border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(108,99,255,0.15)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 bg-gradient-to-b from-accent1 to-secondary h-full"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-1 block">Lead Profile</span>
            <h3 className="text-2xl font-bold text-white">Acme CRM</h3>
          </div>
          <div className="flex gap-3">
             <span className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
               <Globe className="w-3 h-3 text-blue-400"/> Reddit
             </span>
             <span className="bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold px-3 py-1.5 rounded-full">
               Score: 8.7 / 10
             </span>
          </div>
        </div>

        <div className="bg-[#050510] border border-white/5 p-4 rounded-xl mb-8">
          <p className="text-sm font-medium text-textMuted mb-2">Identified Pain Point</p>
          <p className="text-base text-gray-200 italic">"Our current CRM is extremely slow. We spend more time waiting for pages to load than making calls."</p>
        </div>

        <div className="text-center pt-4">
          <a href="https://leadhunter1.onrender.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-accent1 to-accent2 text-white font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)]">
            Try Demo <ArrowRight className="w-4 h-4"/>
          </a>
        </div>
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <div className="py-32 relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-accent1/20 to-transparent pointer-events-none -z-10"></div>
      <Section className="text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
          Stop guessing where your <br className="hidden md:block"/> customers are.
        </h2>
        <div className="flex flex-col items-center gap-6">
          <a href="https://leadhunter1.onrender.com" target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-full bg-gradient-to-r from-accent1 to-accent2 text-white font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(108,99,255,0.4)]">
            Try Demo — It's Free
          </a>
        </div>
      </Section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050510] py-12 relative z-10">
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Search className="text-accent2 w-5 h-5" />
          <span className="text-lg font-bold text-white tracking-tight">LeadHunter</span>
        </div>
        <div className="flex gap-8 text-sm font-medium">
          <a href="https://leadhunter1.onrender.com" target="_blank" rel="noopener noreferrer" className="text-textMuted hover:text-white transition-colors">Try Demo</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-textMuted hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-6 mt-8 text-center md:text-left text-xs text-textMuted/60">
        &copy; {new Date().getFullYear()} LeadHunter. All rights reserved.
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-textPrimary overflow-x-hidden relative selection:bg-accent1/30">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <ProductPreview />
      <Features />
      <DemoLead />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default App;
