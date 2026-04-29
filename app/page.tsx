'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Shield, 
  TrendingUp, 
  Wallet, 
  Zap, 
  ChevronRight,
  Database,
  RefreshCw,
  Power,
  Search,
  Filter,
  X,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectWallet, Wallet as OnchainWallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink } from '@coinbase/onchainkit/wallet';
import { Address, Name, Avatar, Identity } from '@coinbase/onchainkit/identity';

export default function DEXDashboard() {
  const { address, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDexes, setSelectedDexes] = useState(['ALL']);
  const [tvlRange, setTvlRange] = useState({ min: 0, max: 2000 }); // in Millions
  const [volRange, setVolRange] = useState({ min: 0, max: 100 }); // in Millions
  const [showFilters, setShowFilters] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<{id: string; title: string; pair: string; dex: string; reason: string; type: 'success' | 'warning'}[]>([]);
  const [maxAlerts, setMaxAlerts] = useState(3);

  const handleMaxAlertsChange = (val: number) => {
    setMaxAlerts(val);
    setActiveAlerts(prev => prev.slice(0, val));
  };

  const [dexData, setDexData] = useState([
    { pair: 'WETH / USDC', dex: 'UNI-V3', dexColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20', tvl: '$482.4M', vol: '$12.8M', spread: '0.002%', trend: 'up' },
    { pair: 'WBTC / WETH', dex: 'CURVE', dexColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', tvl: '$1.2B', vol: '$34.1M', spread: '0.008%', trend: 'up' },
    { pair: 'USDT / DAI', dex: 'BALANCER', dexColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20', tvl: '$89.2M', vol: '$1.2M', spread: '0.001%', trend: 'stable' },
    { pair: 'PEPE / WETH', dex: 'UNI-V2', dexColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20', tvl: '$12.1M', vol: '$8.4M', spread: '0.421%', trend: 'down' },
    { pair: 'LINK / WETH', dex: 'SUSHI', dexColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20', tvl: '$45.8M', vol: '$0.9M', spread: '0.012%', trend: 'up' },
  ]);
  const [logs, setLogs] = useState([
    { id: 1, text: 'Scanning Uniswap V3 concentrated liquidity positions...', type: 'active', time: '14:21:04' },
    { id: 2, text: 'Detected volume spike in WBTC/USDC pool. Adjusting range...', type: 'info', time: '14:20:58' },
    { id: 3, text: 'Aggregating DEX data from Sushi, Curve, and Balancer nodes.', type: 'info', time: '14:19:12' },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newLog = {
        id: Date.now(),
        text: 'Manual data synchronization triggered. Re-indexing all DEX nodes...',
        type: 'active',
        time: new Date().toLocaleTimeString([], { hour12: false }),
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
      
      // Slightly randomize TVL/Vol for visual "refresh" feedback
      setDexData(prev => {
        const next = prev.map(item => ({
          ...item,
          vol: `$${(Math.random() * 50).toFixed(1)}M`,
          spread: `${(Math.random() * 0.01).toFixed(3)}%`
        }));
        return next;
      });
      
      scanForOpportunities();
      setIsRefreshing(false);
    }, 1000);
  };

  const parseValue = (val: string) => {
    const numeric = parseFloat(val.replace(/[^0-9.-]/g, ''));
    if (val.includes('B')) return numeric * 1000;
    return numeric;
  };

  const filteredData = dexData.filter(item => {
    const matchesSearch = item.pair.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.dex.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDex = selectedDexes.includes('ALL') || selectedDexes.some(d => item.dex.includes(d));
    
    const tvlVal = parseValue(item.tvl);
    const volVal = parseValue(item.vol);
    
    const matchesTVL = tvlVal >= tvlRange.min && tvlVal <= tvlRange.max;
    const matchesVol = volVal >= volRange.min && volVal <= volRange.max;

    return matchesSearch && matchesDex && matchesTVL && matchesVol;
  });

  const toggleDex = (dex: string) => {
    if (dex === 'ALL') {
      setSelectedDexes(['ALL']);
    } else {
      setSelectedDexes(prev => {
        const filtered = prev.filter(d => d !== 'ALL');
        if (filtered.includes(dex)) {
          const next = filtered.filter(d => d !== dex);
          return next.length === 0 ? ['ALL'] : next;
        } else {
          return [...filtered, dex];
        }
      });
    }
  };

  const removeAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const scanForOpportunities = useCallback(() => {
    const opportunities = dexData.filter(item => {
      const spread = parseFloat(item.spread);
      const vol = parseValue(item.vol);
      return spread < 0.005 || vol > 30;
    });

    if (opportunities.length > 0) {
      const randomOpp = opportunities[Math.floor(Math.random() * opportunities.length)];
      const spread = parseFloat(randomOpp.spread);
      
      const newAlert = {
        id: Math.random().toString(36).substring(7),
        title: spread < 0.005 ? 'High Efficiency Trade' : 'Volume Breakout',
        pair: randomOpp.pair,
        dex: randomOpp.dex,
        reason: spread < 0.005 ? `Optimal spread detected (${randomOpp.spread})` : `High institutional flow ($${randomOpp.vol})`,
        type: spread < 0.005 ? 'success' : 'warning' as const
      };

      setActiveAlerts(prev => {
        // Prevent duplicate alerts for the same pair in a short window
        if (prev.some(a => a.pair === newAlert.pair)) return prev;
        return [newAlert, ...prev].slice(0, maxAlerts);
      });
    }
  }, [dexData, maxAlerts]);

  useEffect(() => {
    sdk.actions.ready();
    
    // Simulate real-time logs
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        text: `Network pulse ${Math.random().toString(36).substring(7).toUpperCase()}: Processing DEX signatures...`,
        type: 'info',
        time: new Date().toLocaleTimeString([], { hour12: false }),
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
      
      // Periodic scan
      if (Math.random() > 0.7) {
        scanForOpportunities();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [scanForOpportunities]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg selection:bg-brand-accent/30">
      {/* Header */}
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-8 bg-brand-surface shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-accent to-blue-600 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/40 -rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            SENTINEL<span className="text-brand-accent">.AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#ffffff05] border border-[#ffffff10] rounded text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-500">ETH Mainnet connected</span>
          </div>
          
          <div className="flex items-center">
            <OnchainWallet>
              <ConnectWallet className="!bg-brand-surface !border !border-brand-border !rounded !px-4 !py-1.5 !text-white hover:!bg-white/5 transition-all">
                <Avatar className="h-6 w-6" />
                <Name className="text-sm font-mono text-cyan-100" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">Wallet Assets</WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </OnchainWallet>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-1 p-1 bg-brand-border-muted overflow-hidden">
        
        {/* Sidebar Left: Agent Intel */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-1 overflow-y-auto">
          <section className="flex-1 immersive-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-3 h-3 text-brand-accent" /> Neural Processor
              </h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse [animation-delay:200ms]"></div>
                <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse [animation-delay:400ms]"></div>
              </div>
            </div>
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 border-l-2 ${log.type === 'active' ? 'bg-brand-accent/5 border-brand-accent' : 'bg-white/5 border-zinc-700'}`}
                  >
                    <p className={`text-xs leading-relaxed font-medium ${log.type === 'active' ? 'text-brand-accent' : 'text-zinc-300'}`}>
                      {log.text}
                    </p>
                    <span className="text-[9px] font-mono opacity-50 block mt-1 uppercase">{log.time} UTC</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section className="h-48 immersive-card p-5">
            <h3 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">Active Strategy</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-zinc-400">Yield Optimization</span>
                <span className="text-lg font-mono text-white">18.4% <span className="text-xs text-brand-accent">APY</span></span>
              </div>
              <div className="w-full h-1 bg-zinc-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-brand-accent shadow-[0_0_10px_#06b6d4]"
                ></motion.div>
              </div>
              <p className="text-[10px] text-zinc-500 italic">Risk profile: Conservative-Aggressive</p>
            </div>
          </section>
        </aside>

        {/* Center: DEX Visualizer */}
        <section className="col-span-12 lg:col-span-6 immersive-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-brand-border-muted flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-accent" /> LIVE DEX AGGREGATION
            </h2>
            <div className="flex gap-2 text-[10px] font-mono uppercase">
              <button className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded">Pools</button>
              <button className="px-2 py-0.5 text-zinc-600 hover:text-zinc-400 transition-colors">Swaps</button>
              <button className="px-2 py-0.5 text-zinc-600 hover:text-zinc-400 transition-colors">Flows</button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-x-auto">
            {/* Filters UI */}
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Search asset pairs or DEX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-sm py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-brand-accent text-brand-bg' : 'bg-[#ffffff05] border border-[#ffffff10] text-zinc-400 hover:text-white'}`}
                >
                  <Filter className="w-3 h-3" />
                  Filters
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-brand-border-muted bg-white/[0.02] rounded-sm mt-2">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">DEX Source</label>
                        <div className="flex flex-wrap gap-2">
                          {['ALL', 'UNI', 'CURVE', 'BALANCER', 'SUSHI'].map((dex) => (
                            <button
                              key={dex}
                              onClick={() => toggleDex(dex)}
                              className={`px-3 py-1 text-[10px] font-mono border transition-all ${selectedDexes.includes(dex) ? 'bg-brand-accent/20 border-brand-accent text-brand-accent' : 'border-[#ffffff10] text-zinc-500 hover:text-zinc-300'}`}
                            >
                              {dex}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TVL Range ($M)</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="number"
                            value={tvlRange.min}
                            onChange={(e) => setTvlRange({ ...tvlRange, min: parseInt(e.target.value) || 0 })}
                            className="w-1/2 bg-[#ffffff05] border border-[#ffffff10] rounded-sm p-2 text-xs font-mono focus:outline-none"
                            placeholder="Min"
                          />
                          <span className="text-zinc-600">-</span>
                          <input 
                            type="number"
                            value={tvlRange.max}
                            onChange={(e) => setTvlRange({ ...tvlRange, max: parseInt(e.target.value) || 0 })}
                            className="w-1/2 bg-[#ffffff05] border border-[#ffffff10] rounded-sm p-2 text-xs font-mono focus:outline-none"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">24h Vol Range ($M)</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="number"
                            value={volRange.min}
                            onChange={(e) => setVolRange({ ...volRange, min: parseInt(e.target.value) || 0 })}
                            className="w-1/2 bg-[#ffffff05] border border-[#ffffff10] rounded-sm p-2 text-xs font-mono focus:outline-none"
                            placeholder="Min"
                          />
                          <span className="text-zinc-600">-</span>
                          <input 
                            type="number"
                            value={volRange.max}
                            onChange={(e) => setVolRange({ ...volRange, max: parseInt(e.target.value) || 0 })}
                            className="w-1/2 bg-[#ffffff05] border border-[#ffffff10] rounded-sm p-2 text-xs font-mono focus:outline-none"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <table className="w-full">
              <thead>
                <tr class="text-left text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
                  <th className="pb-4">Asset Pair</th>
                  <th className="pb-4">DEX</th>
                  <th className="pb-4 text-right">TVL</th>
                  <th className="pb-4 text-right">24h Vol</th>
                  <th className="pb-4 text-right">Spread</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {filteredData.map((item, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] group transition-colors">
                    <td className="py-4 text-white font-sans font-medium">{item.pair}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 border rounded-sm text-[10px] ${item.dexColor}`}>
                        {item.dex}
                      </span>
                    </td>
                    <td className="py-4 text-right text-zinc-400">{item.tvl}</td>
                    <td className="py-4 text-right text-white">{item.vol}</td>
                    <td className="py-4 text-right">
                      <span className={`font-bold ${parseFloat(item.spread) < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.spread}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-8 flex justify-center">
               <div className="w-full h-40 border border-brand-accent/20 bg-brand-accent/5 relative overflow-hidden rounded-sm">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                  <motion.div 
                    animate={{ x: [0, 100, 0], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-accent/10 to-transparent skew-x-12"
                  ></motion.div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-accent/20 to-transparent"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-brand-accent/30 blur-sm"></div>
                  <div className="p-3 text-[10px] text-brand-accent font-mono flex justify-between relative z-10 uppercase tracking-tighter">
                    <span className="flex items-center gap-2"><Database className="w-3 h-3" /> Real-time Liquidity Wavefront</span>
                    <span className="flex items-center gap-2">Nodes: 128 Active <RefreshCw className="w-3 h-3 animate-spin duration-700" /></span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Sidebar Right: Market Context */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-1 overflow-y-auto">
          <div className="flex-1 immersive-card p-5">
            <h3 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-brand-accent" /> Market Context
            </h3>
            <div className="space-y-8">
              <div className="flex flex-col">
                 <span className="text-[10px] text-brand-text-muted uppercase mb-1">ETH Price</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-mono text-white">$2,482.11</span>
                   <span className="text-xs text-emerald-400 font-sans font-normal">+1.2%</span>
                 </div>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-brand-text-muted uppercase mb-1">Avg Gas Fee</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-xl font-mono text-amber-500">14 Gwei</span>
                   <span className="text-[10px] text-brand-text-muted font-sans font-normal uppercase">Optimized / Low</span>
                 </div>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-brand-text-muted uppercase mb-1">Global DEX Volume</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-xl font-mono text-white">$4.2B</span>
                   <span className="text-xs text-brand-text-muted font-sans font-normal uppercase">24HR Aggregated</span>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/[0.03]">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Alert Limit</label>
                 <div className="flex items-center gap-3">
                   <input 
                     type="range" 
                     min="1" 
                     max="10" 
                     value={maxAlerts}
                     onChange={(e) => handleMaxAlertsChange(parseInt(e.target.value))}
                     className="flex-1 accent-brand-accent h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                   />
                   <span className="text-xs font-mono text-brand-accent w-4">{maxAlerts}</span>
                 </div>
                 <p className="text-[9px] text-zinc-600 mt-2 italic">Max concurrent active notifications</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-brand-accent border border-brand-accent p-6 flex flex-col justify-between group">
             <h4 className="text-sm font-bold text-brand-bg uppercase leading-none flex items-center gap-2">
               <Shield className="w-4 h-4" /> Agent Quick Controls
             </h4>
             <div className="space-y-2">
                <button className="w-full py-3 bg-brand-bg text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Zap className="w-3 h-3" /> Rebalance Pools
                </button>
                <button className="w-full py-3 border-2 border-brand-bg text-brand-bg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-bg/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Power className="w-3 h-3" /> Stop Auto-Trader
                </button>
             </div>
             <div className="flex justify-between items-center border-t border-brand-bg/20 pt-2">
               <span className="text-[9px] text-brand-bg/70 font-bold uppercase">System Latency: 4ms</span>
               <ChevronRight className="w-3 h-3 text-brand-bg/50 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-brand-bg border-t border-brand-border px-8 flex items-center justify-between shrink-0">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Uptime</span>
            <span className="text-[10px] font-mono text-white">342:12:04</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Sync Index</span>
            <span className="text-[10px] font-mono text-emerald-400">100%</span>
          </div>
        </div>
        <div className="hidden sm:block text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
          Build v2.4.1-Stable // Encrypted Protocol v2
        </div>
      </footer>

      {/* Alert System Overlay */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {activeAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`w-80 p-4 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group ${
                alert.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-amber-950/40 border-amber-500/30'
              }`}>
                {/* Visual accents */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  alert.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {alert.type === 'success' ? (
                      <Zap className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      alert.type === 'success' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {alert.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeAlert(alert.id)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-white text-xs font-bold font-mono">{alert.pair} <span className="text-white/40 font-normal">on</span> {alert.dex}</h4>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {alert.reason}
                  </p>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex gap-1">
                    <div className={`w-1 h-1 rounded-full ${alert.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <div className={`w-1 h-1 rounded-full ${alert.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse delay-75`} />
                  </div>
                  <button className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border transition-all ${
                    alert.type === 'success' 
                      ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  }`}>
                    Execute Alpha
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
