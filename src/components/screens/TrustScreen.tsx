import React, { useState } from 'react';
import { store } from '../../services/store';
import { BlockchainRecord } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Hash,
  Database,
  Search,
  Lock,
  Star,
  Info
} from 'lucide-react';

interface TrustScreenProps {
  onOpenExplorer?: (txHash: string) => void;
}

export const TrustScreen: React.FC<TrustScreenProps> = ({ onOpenExplorer }) => {
  const [networkMode, setNetworkMode] = useState<'simulated' | 'sepolia'>('simulated');
  const [searchTx, setSearchTx] = useState('');

  const records = store.getBlockchainRecords();
  const provider = store.getSelectedProvider();

  const filteredRecords = records.filter(
    (r) =>
      r.txHash.toLowerCase().includes(searchTx.toLowerCase()) ||
      r.entityName.toLowerCase().includes(searchTx.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Banner Header */}
      <div className="bg-emerald-950 text-white px-5 pt-8 pb-5 rounded-b-[28px] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight font-['Outfit'] flex items-center gap-1.5">
              <span>ONESETU TRUST</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              Decentralized Integrity & Transaction Proofs
            </p>
          </div>

          {/* Mode Badge */}
          <div className="text-[10px] font-bold bg-emerald-900 border border-emerald-700/60 text-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{networkMode === 'simulated' ? 'LOCAL DEV CHAIN' : 'SEPOLIA'}</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-emerald-100">
          <div className="bg-emerald-900/60 p-2 rounded-xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero-Knowledge Identity</span>
          </div>
          <div className="bg-emerald-900/60 p-2 rounded-xl flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Immutable Job Proofs</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {/* Prominent Featured Verified Provider Card (Matches Prompt Section 35) */}
        <div className="bg-white border-2 border-emerald-600/40 rounded-3xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>✓ VERIFIED PROVIDER</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Smart Contract Proof
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{provider.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{provider.completedJobs} Completed Jobs</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {provider.rating}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Verification:</span>
              <span className="font-bold text-emerald-700">Blockchain Verified</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Transaction:</span>
              <span className="font-mono font-bold text-slate-800">
                0x82A7...91FD
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Contract:</span>
              <span className="font-mono text-slate-600">OneSetuTrust.sol</span>
            </div>
          </div>

          <button
            onClick={() => onOpenExplorer?.('0x82A7C491024DFE56890B91FD')}
            className="w-full mt-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>VIEW RECORD</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Network & Simulation Disclaimer (Prompt Section 36) */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed flex gap-2">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Verification Standard:</span> All proofs
            contain real SHA-256 state commitments. Currently connected to{' '}
            <span className="font-bold">OneSetu Local Ledger (Testnet Mock)</span>.
          </div>
        </div>

        {/* Search ledger */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTx}
            onChange={(e) => setSearchTx(e.target.value)}
            placeholder="Search transaction hash or entity..."
            className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        {/* Ledger Entries */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider text-slate-400">
            Recent On-Chain Activity ({filteredRecords.length})
          </h4>

          <div className="space-y-2.5">
            {filteredRecords.map((rec) => (
              <div
                key={rec.txHash}
                onClick={() => onOpenExplorer?.(rec.txHash)}
                className="bg-white border border-slate-100 rounded-2xl p-3 shadow-2xs hover:border-emerald-200 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Block #{rec.blockNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">{rec.timestamp}</span>
                </div>

                <div className="text-xs font-bold text-slate-900 line-clamp-1">
                  {rec.entityName}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="truncate max-w-[200px]">{rec.txHash}</span>
                  <span className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Inspect →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
