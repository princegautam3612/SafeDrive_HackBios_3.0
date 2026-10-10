import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, QrCode, Copy, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardItem } from '../../types';

interface RedeemModalProps {
  reward: RewardItem | null;
  userPoints: number;
  onClose: () => void;
  onConfirmRedeem: (reward: RewardItem) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  reward,
  userPoints,
  onClose,
  onConfirmRedeem,
}) => {
  const [redeemed, setRedeemed] = useState(false);
  const [copied, setCopied] = useState(false);
  const voucherCode = reward ? `SAFE-${reward.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}` : '';

  if (!reward) return null;

  const canAfford = userPoints >= reward.cost;

  const handleRedeem = () => {
    if (!canAfford) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setRedeemed(true);
    onConfirmRedeem(reward);
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full border border-slate-200"
        >
          {/* Header image */}
          <div className="relative h-36 w-full overflow-hidden bg-slate-100">
            <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                {reward.badge}
              </span>
              <h3 className="text-sm font-bold mt-1 text-white leading-tight font-['Outfit']">{reward.title}</h3>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            {!redeemed ? (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Reward Cost</span>
                    <span className="font-mono font-bold text-emerald-700">{reward.cost.toLocaleString()} ✪</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-500 font-medium">Your Balance</span>
                    <span className={`font-mono font-bold ${canAfford ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {userPoints.toLocaleString()} ✪
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {reward.terms}
                  </p>
                </div>

                <div className="pt-1">
                  {canAfford ? (
                    <button
                      onClick={handleRedeem}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Confirm Redemption ({reward.cost} ✪)</span>
                    </button>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-rose-600 font-mono font-bold mb-2">
                        Need {reward.cost - userPoints} more points to redeem
                      </p>
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer border border-slate-200"
                      >
                        Keep Driving to Earn Points
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-2 space-y-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-['Outfit']">Voucher Generated!</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Valid for {reward.expiryDays} days at {reward.partner}
                  </p>
                </div>

                {/* Digital Barcode / QR Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs mb-2">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-700 tracking-wider">
                    {voucherCode}
                  </div>
                  <button
                    onClick={copyVoucher}
                    className="mt-2 text-[10px] font-mono font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to clipboard' : 'Copy Voucher Code'}</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer border border-slate-200"
                >
                  Done & Return to Marketplace
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

