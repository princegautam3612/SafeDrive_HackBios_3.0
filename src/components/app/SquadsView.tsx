import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, Gauge, Moon, Shield, ArrowUpRight, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { SquadMember, ActiveChallenge } from '../../types';
import { SQUAD_MEMBERS, ACTIVE_CHALLENGES } from '../../data/mockData';

interface SquadsViewProps {
  onOpenHome: () => void;
  onOpenRoadIQ: () => void;
}

export const SquadsView: React.FC<SquadsViewProps> = ({ onOpenHome, onOpenRoadIQ }) => {
  const [members, setMembers] = useState<SquadMember[]>(SQUAD_MEMBERS);
  const [challenges, setChallenges] = useState<ActiveChallenge[]>(ACTIVE_CHALLENGES);
  const [activeTab, setActiveTab] = useState<'squad' | 'city' | 'global'>('squad');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-6 px-5 pt-3 bg-white text-slate-900 max-w-md mx-auto"
    >
      {/* Hero Card: The Urban Guardians */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-xl mb-4 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 block mb-0.5">
              THE URBAN GUARDIANS
            </span>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight font-['Outfit']">
              Squad Dashboard
            </h1>
          </div>

          {/* 88 Team Score Box */}
          <div className="bg-emerald-600 rounded-xl p-2.5 px-3 flex flex-col items-center justify-center text-center shadow-xs border border-emerald-400/30">
            <span className="text-2xl font-black text-white font-mono leading-none">88</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-tight text-emerald-200 mt-1">
              TEAM SCORE
            </span>
          </div>
        </div>

        {/* Squad Avatars Cluster */}
        <div className="flex items-center gap-2 mt-4 mb-3">
          <div className="flex -space-x-2 overflow-hidden">
            <img className="inline-block h-7 w-7 rounded-full ring-2 ring-emerald-950 object-cover" src={members[0].avatar} alt="" />
            <img className="inline-block h-7 w-7 rounded-full ring-2 ring-emerald-950 object-cover" src={members[1].avatar} alt="" />
            <img className="inline-block h-7 w-7 rounded-full ring-2 ring-emerald-950 object-cover" src={members[2].avatar} alt="" />
            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-emerald-950">
              +12
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
          Top 5% this week! Keep riding clean to protect your community and maintain zero incidents.
        </p>
      </div>

      {/* Drive for Good Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight font-['Outfit']">Drive for Good</h2>
            <p className="text-[11px] text-slate-500">Your safe miles are planting trees</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            style={{ width: '70%' }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-4">
          <span>420 / 600 KM REACHED</span>
          <span className="text-amber-700 font-bold uppercase">3 TREES READY</span>
        </div>

        {/* Two Metrics Boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
              LOCAL IMPACT
            </span>
            <div className="text-xs font-bold text-slate-800">Lodi Gardens</div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
              NEXT MILESTONE
            </span>
            <div className="text-xs font-black text-amber-700 font-mono">180 KM</div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-['Outfit']">Active Challenges</h3>
          <button
            onClick={onOpenHome}
            className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider cursor-pointer hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Challenge 1: 300km Clean Driving */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">300km Clean Driving</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-500">225/300</span>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold shrink-0">
              75% Done
            </span>
          </div>

          {/* Challenge 2: Midnight Vigilante */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">Midnight Vigilante</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">0 Infractions after 11 PM</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold shrink-0">
              Active Focus
            </span>
          </div>
        </div>
      </div>

      {/* Squad Contributors */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-['Outfit']">Squad Contributors</h3>

        <div className="bg-white rounded-2xl p-2 divide-y divide-slate-100 border border-slate-200 shadow-xs">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                member.isCurrentUser ? 'bg-emerald-50 border border-emerald-200' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-1.5 ring-white ${
                      member.score >= 90
                        ? 'bg-emerald-500'
                        : member.score >= 80
                        ? 'bg-emerald-600'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                    {member.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-mono font-bold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{member.status}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-emerald-700 font-mono">{member.score}</div>
                <div className="text-[8px] font-mono font-bold uppercase tracking-tight text-slate-400">
                  AVG SCORE
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

