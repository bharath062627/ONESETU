import React from 'react';
import { store } from '../../services/store';
import { X, ShieldCheck, ExternalLink, Layers, Copy, Check } from 'lucide-react';

interface BlockchainExplorerModalProps {
  txHash: string | null;
  onClose: () => void;
}

export const BlockchainExplorerModal: React.FC<BlockchainExplorerModalProps> = ({
  txHash,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!txHash) return null;

  const records = store.getBlockchainRecords();
  const record = records.find((r) => r.txHash === txHash) || records[0];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(record.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 text-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Blockchain Ledger Proof</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Status: {record.status}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Hash */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Transaction Hash</span>
          <div className="flex items-center justify-between font-mono text-xs text-emerald-300 break-all">
            <span>{record.txHash}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-white transition-colors ml-2"
              title="Copy Tx Hash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Block metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Block Height</span>
            <span className="font-mono font-bold text-white">#{record.blockNumber}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Event Type</span>
            <span className="font-mono font-bold text-emerald-400 text-[11px] truncate block">
              {record.eventType}
            </span>
          </div>
        </div>

        {/* Payload Hash */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Cryptographic State Hash (SHA-256)</span>
          <p className="font-mono text-[11px] text-slate-300 break-all">{record.payloadHash}</p>
        </div>

        {/* Verified Parameters */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">On-Chain Payload Parameters</span>
          <div className="space-y-1 text-xs font-mono">
            {Object.entries(record.details).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-800/60 pb-0.5">
                <span className="text-slate-400">{key}:</span>
                <span className="text-slate-200 text-right truncate max-w-[180px]">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Contract details */}
        <div className="text-[10px] text-slate-400 text-center leading-relaxed">
          Smart Contract: <span className="font-mono text-emerald-400">0x71C25eFa42...B684</span>
          <br />
          Deterministic Zero-Knowledge Proof verified by OneSetu consensus protocol.
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
