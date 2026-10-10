import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, ArrowDownLeft, Award, Clock } from 'lucide-react';
import { PointTransaction } from '../../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PointTransaction[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, transactions }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full border border-slate-200 p-5 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Points History</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 py-2 space-y-2 flex-1 my-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="pt-2 flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      tx.type === 'earn' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {tx.type === 'earn' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{tx.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{tx.date} • {tx.category}</span>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold font-mono shrink-0 pl-2 ${
                    tx.type === 'earn' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'earn' ? `+${tx.amount}` : tx.amount} ✪
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer mt-2 border border-slate-200"
          >
            Close Ledger
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

