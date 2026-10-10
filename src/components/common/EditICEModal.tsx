import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, HeartHandshake, Phone, User, ShieldAlert,
  Check, AlertCircle, Save, Send
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface EditICEModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyContact: EmergencyContact;
  onSave: (contact: EmergencyContact) => void;
  onTestDispatch?: (contact: EmergencyContact) => void;
}

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Spouse',
  'Sibling',
  'Child',
  'Friend',
  'Guardian',
  'Colleague',
  'Other',
];

export const EditICEModal: React.FC<EditICEModalProps> = ({
  isOpen,
  onClose,
  emergencyContact,
  onSave,
  onTestDispatch,
}) => {
  const [name, setName] = useState(emergencyContact.name || '');
  const [phone, setPhone] = useState(emergencyContact.phone || '');
  const [relationship, setRelationship] = useState(emergencyContact.relationship || 'Parent');
  const [customRelation, setCustomRelation] = useState(
    RELATIONSHIP_OPTIONS.includes(emergencyContact.relationship) ? '' : (emergencyContact.relationship || '')
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(emergencyContact.name || '');
      setPhone(emergencyContact.phone || '');
      const isOption = RELATIONSHIP_OPTIONS.includes(emergencyContact.relationship);
      setRelationship(isOption ? emergencyContact.relationship : (emergencyContact.relationship ? 'Other' : 'Parent'));
      setCustomRelation(isOption ? '' : (emergencyContact.relationship || ''));
      setSavedSuccess(false);
      setTestSent(false);
      setErrorMsg(null);
    }
  }, [isOpen, emergencyContact]);

  if (!isOpen) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const finalRelationship = (relationship === 'Other' ? customRelation.trim() : relationship) || 'Emergency Contact';

    if (!trimmedName) {
      setErrorMsg('Please enter the emergency contact name.');
      return;
    }

    if (!trimmedPhone || trimmedPhone.replace(/[^\d]/g, '').length < 8) {
      setErrorMsg('Please enter a valid phone number (at least 8-10 digits).');
      return;
    }

    const updated: EmergencyContact = {
      name: trimmedName,
      phone: trimmedPhone,
      relationship: finalRelationship,
    };

    onSave(updated);
    setSavedSuccess(true);
    setErrorMsg(null);

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleTestAutoDispatch = () => {
    const finalRelationship = (relationship === 'Other' ? customRelation.trim() : relationship) || 'Emergency Contact';
    const current: EmergencyContact = {
      name: name.trim() || emergencyContact.name || 'Emergency Contact',
      phone: phone.trim() || emergencyContact.phone || '',
      relationship: finalRelationship,
    };

    if (onTestDispatch) {
      onTestDispatch(current);
    }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-rose-200 text-slate-900 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-600 via-rose-700 to-red-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-90 block">
                  IN CASE OF EMERGENCY (ICE)
                </span>
                <h2 className="text-base font-black font-['Outfit'] leading-tight">
                  Edit Emergency Contact
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Auto Dispatch Notice */}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-900 leading-snug">
                <strong>Collision Auto-Dispatch:</strong> In the event of a verified severe crash or rollover, automated distress alerts containing your live GPS coordinates are immediately dispatched to this contact.
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-800 text-xs font-mono font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Emergency Contact Saved Successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Contact Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter full name of emergency contact"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Emergency Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter phone number (e.g. +91 9876543210)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  Include country code for automated SMS dispatch &amp; emergency dialer
                </span>
              </div>

              {/* Relationship Input */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Relationship to Driver
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => {
                        setRelationship(rel);
                        if (rel !== 'Other') setCustomRelation('');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        relationship === rel
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>

                {relationship === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customRelation}
                      onChange={(e) => setCustomRelation(e.target.value)}
                      placeholder="Specify relationship (e.g. Neighbor, Roommate)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Contact Details</span>
                </button>

                {phone.trim() && (
                  <button
                    type="button"
                    onClick={handleTestAutoDispatch}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    {testSent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Test SMS Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-slate-500" />
                        <span>Test SOS Dispatch Format</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
