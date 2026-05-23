import { useState } from 'react';

export const BillingSection = () => {
  // Billing cycle state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Slider states
  const [docs, setDocs] = useState(500);
  const [tokens, setTokens] = useState(50000);

  // Constants
  const BASE_PRICE_MONTHLY = 1900;
  const BASE_PRICE_ANNUAL = 1520;
  const BASE_PRICE = billingCycle === 'annual' ? BASE_PRICE_ANNUAL : BASE_PRICE_MONTHLY;
  
  const BASE_DOCS = 500;
  const BASE_TOKENS = 50000;
  const DOC_RATE = 3;
  const TOKEN_RATE_PER_100K = 12;

  // Calculations
  const extraDocs = Math.max(0, docs - BASE_DOCS);
  const docOverage = extraDocs * DOC_RATE;

  const extraTokensDaily = Math.max(0, tokens - BASE_TOKENS);
  const tokenOverage = Math.round((extraTokensDaily / 100000) * TOKEN_RATE_PER_100K * 30);

  const total = BASE_PRICE + docOverage + tokenOverage;

  const renderFeature = (text: string, icon: string = 'check', iconColor: string = 'text-green-500', isLock = false) => (
    <div className="flex items-start gap-2 text-xs font-medium text-light-text dark:text-dark-text/80 leading-relaxed mb-3">
      <span className={`material-symbols-rounded text-[14px] mt-[1px] shrink-0 ${iconColor} ${isLock ? 'text-[#8b5cf6]' : ''}`}>
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );

  return (
    <section className="font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-1">
            Plans
          </h2>
          <p className="text-sm text-light-text/60 dark:text-dark-text/60 font-medium">
            Scale your AI document intelligence. Cancel anytime.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex bg-light-bg dark:bg-[#121214] p-1 rounded-xl border border-light-border dark:border-white/5 shadow-inner w-max">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors ${
              billingCycle === "monthly"
                ? "text-light-primary dark:text-white bg-white dark:bg-white/10 shadow-sm border border-light-border dark:border-white/10"
                : "text-light-text/50 dark:text-white/50 bg-transparent hover:text-light-text border border-transparent"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              billingCycle === "annual"
                ? "text-light-primary dark:text-white bg-white dark:bg-white/10 shadow-sm border border-light-border dark:border-white/10"
                : "text-light-text/50 dark:text-white/50 bg-transparent hover:text-light-text border border-transparent"
            }`}
          >
            Annual
            <span className="bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        
        {/* Sandbox */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-white/5 shadow-sm flex flex-col h-full relative group">
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Free embed
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">Sandbox</h3>
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 mb-4 h-8">
            Try Context inside your product
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">0 EGP</span>
              <span className="text-sm font-semibold text-light-text/50 dark:text-dark-text/50 ml-1">/ mo</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/50 dark:text-dark-text/50 mb-6 h-8">
            Up to 3 seats &middot; no card needed
          </p>
          
          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature('50 documents / month')}
            {renderFeature('Full AI summaries + tags')}
            {renderFeature('Cognitive load on every doc')}
            {renderFeature('Visual Cortex OCR')}
            {renderFeature('RAG chat + semantic search')}
            {renderFeature('10,000 tokens / day')}
            {renderFeature('DeepThinker comparison', 'lock', '', true)}
            {renderFeature('AI folder organizer', 'lock', '', true)}
            {renderFeature('Synthesizer', 'lock', '', true)}
            {renderFeature('ZIP export', 'lock', '', true)}
          </div>
          
          <button className="mt-6 w-full py-2.5 rounded-lg border border-light-border dark:border-white/10 text-light-text dark:text-white font-bold text-sm hover:bg-light-bg dark:hover:bg-white/5 transition-colors shadow-sm flex justify-center items-center gap-1">
            Start free <span className="material-symbols-rounded text-[16px]">arrow_outward</span>
          </button>
        </div>

        {/* Startup (Highlighted) */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border-2 border-light-primary dark:border-dark-primary shadow-[0_4px_24px_rgba(16,55,102,0.08)] dark:shadow-[0_4px_24px_rgba(139,92,246,0.1)] flex flex-col h-full relative transform scale-[1.02] z-10">
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary text-[10px] font-bold tracking-wide uppercase mb-4 w-max border border-light-primary/20 dark:border-dark-primary/20">
            Most adopted
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">Startup</h3>
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 mb-4 h-8">
            Growing products embedding Context
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            {billingCycle === 'annual' && (
              <span className="text-xs font-semibold text-light-text/40 dark:text-dark-text/40 line-through mb-0.5">Was 1,900 EGP / mo</span>
            )}
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
                {billingCycle === 'annual' ? '1,520' : '1,900'} EGP
              </span>
              <span className="text-sm font-semibold text-light-text/50 dark:text-dark-text/50 ml-1">/ mo</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/50 dark:text-dark-text/50 mb-6 h-8">
            Up to 10 seats &middot; {billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}
          </p>
          
          <div className="flex-1 border-t border-light-primary/20 dark:border-dark-primary/20 pt-6">
            {renderFeature('500 documents / month')}
            {renderFeature('Everything in Sandbox')}
            {renderFeature('50,000 tokens / day')}
            {renderFeature('DeepThinker comparison')}
            {renderFeature('AI folder organizer')}
            {renderFeature('Document synthesizer')}
            {renderFeature('ZIP export of organized folders')}
            {renderFeature('Admin panel + CSV export')}
            {renderFeature('Usage analytics dashboard')}
            {renderFeature('Pay-per-use overage available')}
          </div>
          
          <button className="mt-6 w-full py-2.5 rounded-lg bg-light-primary dark:bg-dark-primary text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-1">
            Get started <span className="material-symbols-rounded text-[16px]">arrow_outward</span>
          </button>
        </div>

        {/* Growth */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-white/5 shadow-sm flex flex-col h-full relative group">
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Scale
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">Growth</h3>
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 mb-4 h-8">
            High-volume or multi-product teams
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            {billingCycle === 'annual' && (
              <span className="text-xs font-semibold text-light-text/40 dark:text-dark-text/40 line-through mb-0.5">Was 4,800 EGP / mo</span>
            )}
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
                {billingCycle === 'annual' ? '3,600' : '4,800'} EGP
              </span>
              <span className="text-sm font-semibold text-light-text/50 dark:text-dark-text/50 ml-1">/ mo</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/50 dark:text-dark-text/50 mb-6 h-8">
            Up to 30 seats &middot; {billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}
          </p>
          
          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature('Unlimited documents')}
            {renderFeature('Everything in Startup')}
            {renderFeature('150,000 tokens / day')}
            {renderFeature('Custom persona fine-tuning')}
            {renderFeature('Priority AI processing queue')}
            {renderFeature('Isolated tenant namespace')}
            {renderFeature('SLA: 99.5% uptime')}
            {renderFeature('Dedicated account manager')}
            {renderFeature('Onboarding session (3 hrs)')}
            {renderFeature('Lower overage rates (-30%)')}
          </div>
          
          <button className="mt-6 w-full py-2.5 rounded-lg border border-light-border dark:border-white/10 text-light-text dark:text-white font-bold text-sm hover:bg-light-bg dark:hover:bg-white/5 transition-colors shadow-sm flex justify-center items-center gap-1">
            Book a call <span className="material-symbols-rounded text-[16px]">arrow_outward</span>
          </button>
        </div>

        {/* Embed / Enterprise */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-white/5 shadow-sm flex flex-col h-full relative group">
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Enterprise
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">Embed</h3>
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 mb-4 h-8">
            White-label inside your platform
          </p>
          <div className="mb-2 h-14 flex items-center">
            <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">Custom</span>
          </div>
          <p className="text-[11px] font-medium text-light-text/50 dark:text-dark-text/50 mb-6 h-8">
            Revenue share or flat licence
          </p>
          
          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature('Everything in Growth')}
            {renderFeature('Full white-label UI')}
            {renderFeature('REST API for all AI services')}
            {renderFeature('Custom token budget per user')}
            {renderFeature('Dedicated infra environment')}
            {renderFeature('Co-marketing in Egypt')}
            {renderFeature('Source code escrow option')}
            {renderFeature('Joint GTM planning')}
            {renderFeature('NDA + MSA provided')}
            {renderFeature('Negotiated overage caps')}
          </div>
          
          <button className="mt-6 w-full py-2.5 rounded-lg border border-light-border dark:border-white/10 text-light-text dark:text-white font-bold text-sm hover:bg-light-bg dark:hover:bg-white/5 transition-colors shadow-sm flex justify-center items-center gap-1">
            Talk to founders <span className="material-symbols-rounded text-[16px]">arrow_outward</span>
          </button>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-light-text/60 dark:text-dark-text/50 mb-12">
        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
        <p>Purple lock icons = paywalled features (DeepThinker, AI folder organizer, synthesizer, ZIP export) — unlocked from Startup upward</p>
      </div>

      {/* Estimator Section */}
      <h2 className="text-sm font-mono font-bold text-light-text/60 dark:text-dark-text/50 uppercase tracking-widest mb-4">
        Usage Estimator — Startup Plan
      </h2>
      
      <div className="bg-[#FAF9F5] dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-white/5 shadow-sm mb-10">
        <h3 className="text-base font-extrabold text-light-text dark:text-white mb-6">Estimate your monthly bill</h3>
        
        {/* Sliders */}
        <div className="space-y-6 max-w-4xl">
          {/* Docs Slider */}
          <div className="flex items-center gap-6">
            <div className="w-40 shrink-0 text-sm font-bold text-light-text/80 dark:text-white/80">
              Documents / month
            </div>
            <div className="flex-1 relative flex items-center">
              <input 
                type="range" min="0" max="2000" step="50" 
                value={docs} onChange={(e) => setDocs(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-light-primary dark:accent-dark-primary" 
              />
            </div>
            <div className="w-20 shrink-0 text-right text-sm font-black font-mono">
              {docs.toLocaleString()}
            </div>
          </div>
          
          {/* Tokens Slider */}
          <div className="flex items-center gap-6">
            <div className="w-40 shrink-0 text-sm font-bold text-light-text/80 dark:text-white/80">
              Tokens / day (avg)
            </div>
            <div className="flex-1 relative flex items-center">
              <input 
                type="range" min="0" max="200000" step="5000" 
                value={tokens} onChange={(e) => setTokens(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-light-primary dark:accent-dark-primary" 
              />
            </div>
            <div className="w-20 shrink-0 text-right text-sm font-black font-mono">
              {tokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">Base plan</span>
            <span className="text-xl font-black text-light-text dark:text-white">{BASE_PRICE.toLocaleString()} EGP</span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">Startup / month</span>
          </div>
          <div className="bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">Doc overage</span>
            <span className="text-xl font-black text-light-text dark:text-white">{docOverage.toLocaleString()} EGP</span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">{extraDocs} extra docs</span>
          </div>
          <div className="bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">Token overage</span>
            <span className="text-xl font-black text-light-text dark:text-white">{tokenOverage.toLocaleString()} EGP</span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">{extraTokensDaily.toLocaleString()} extra / day</span>
          </div>
          <div className="bg-white dark:bg-[#121214] border-2 border-light-primary dark:border-dark-primary rounded-xl p-4 flex flex-col shadow-sm">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">Total est.</span>
            <span className="text-xl font-black text-light-primary dark:text-dark-primary">{total.toLocaleString()} EGP</span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">/ month</span>
          </div>
        </div>
      </div>

      {/* Rates Row */}
      <h2 className="text-[11px] font-mono font-bold text-light-text/60 dark:text-dark-text/50 uppercase tracking-widest mb-4">
        Pay-Per-Use Overage Rates (Startup)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <div className="bg-[#FAF9F5] dark:bg-dark-surface border border-light-border/50 dark:border-white/5 rounded-xl p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-rounded text-[18px] text-green-600 dark:text-green-400">description</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-white mb-0.5">Extra documents</h4>
            <p className="text-[11px] font-medium text-light-text/60 dark:text-white/50 leading-tight">
              3 EGP per document over 500 / mo
            </p>
          </div>
        </div>
        <div className="bg-[#FAF9F5] dark:bg-dark-surface border border-light-border/50 dark:border-white/5 rounded-xl p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-rounded text-[18px] text-purple-600 dark:text-purple-400">memory</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-white mb-0.5">Extra tokens</h4>
            <p className="text-[11px] font-medium text-light-text/60 dark:text-white/50 leading-tight">
              12 EGP per 100K tokens over daily limit
            </p>
          </div>
        </div>
        <div className="bg-[#FAF9F5] dark:bg-dark-surface border border-light-border/50 dark:border-white/5 rounded-xl p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-rounded text-[18px] text-blue-600 dark:text-blue-400">dns</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-white mb-0.5">Storage</h4>
            <p className="text-[11px] font-medium text-light-text/60 dark:text-white/50 leading-tight">
              7 EGP / GB / month over 20 GB
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};
