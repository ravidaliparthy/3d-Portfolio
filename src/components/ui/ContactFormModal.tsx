import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { X, Send, CheckCircle2, AlertCircle, Mail, User, MessageSquare } from 'lucide-react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formTheme, setFormTheme] = useState<'light' | 'dark'>('light');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // User's verified EmailJS credentials
      await emailjs.sendForm(
        'service_btst4cs',
        'template_qf5orga',
        formRef.current,
        'WjvmFynigzZnyBPNw'
      );
      setStatus('success');
      formRef.current.reset();
    } catch (err: unknown) {
      console.error('[EmailJS Error]', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send message. Please try emailing directly to ravidaliparthy@gmail.com'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/60 p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Direct Dispatch Contact Form"
      style={{
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
      }}
    >
      {/* Dispatch Lounge - Light by default, toggleable to transparent Dark Glass */}
      <div className={`relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 pointer-events-auto my-auto text-left transition-all duration-300 ${
        formTheme === 'light'
          ? 'border-2 border-amber-400 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-slate-900'
          : 'border-2 border-amber-400/60 bg-[#04180f]/85 shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_60px_rgba(16,185,129,0.2)] text-white'
      }`}>
        
        {/* Header */}
        <div className={`mb-6 flex items-center justify-between border-b pb-4 relative z-10 ${
          formTheme === 'light' ? 'border-slate-200' : 'border-amber-400/25'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-xs ${
              formTheme === 'light'
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}>
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${
                formTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <span>Direct Dispatch</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${
                  formTheme === 'light'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200'
                }`}>
                  EmailJS Active
                </span>
              </h2>
              <p className={`text-xs font-semibold ${
                formTheme === 'light' ? 'text-slate-600' : 'text-amber-200'
              }`}>
                Transmit inquiries directly to Daliparthy Ravi Krishna Charan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <div className={`flex items-center rounded-lg border p-0.5 text-[10px] font-mono font-bold ${
              formTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-amber-400/40 bg-[#03140c]'
            }`}>
              <button
                type="button"
                onClick={() => setFormTheme('light')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  formTheme === 'light'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setFormTheme('dark')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  formTheme === 'dark'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dark (Glass)
              </button>
            </div>

            <button
              onClick={onClose}
              className={`rounded-full p-2 transition-colors cursor-pointer ${
                formTheme === 'light'
                  ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-amber-200 hover:bg-white/10 hover:text-white'
              }`}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {status === 'success' ? (
          <div className={`py-8 text-center space-y-3 relative z-10 rounded-2xl border p-6 ${
            formTheme === 'light'
              ? 'bg-emerald-50/80 border-emerald-200 text-slate-900'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
          }`}>
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md ${
              formTheme === 'light'
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}>
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className={`text-lg font-black ${formTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Message Successfully Transmitted
            </h3>
            <p className={`text-xs max-w-xs mx-auto leading-relaxed font-medium ${
              formTheme === 'light' ? 'text-slate-600' : 'text-emerald-100'
            }`}>
              Thank you for reaching out! Charan will review your inquiry and respond to your email promptly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-2 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer shadow-md"
            >
              <span>Transmit Another Message</span>
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                formTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
              }`}>
                Your Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3.5 top-3 h-4 w-4 ${
                  formTheme === 'light' ? 'text-slate-400' : 'text-emerald-400'
                }`} />
                <input
                  type="text"
                  name="from_name"
                  required
                  placeholder="e.g. Elena Rostova / Technical Recruiter"
                  className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs transition-all ${
                    formTheme === 'light'
                      ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                formTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
              }`}>
                Your Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-3 h-4 w-4 ${
                  formTheme === 'light' ? 'text-slate-400' : 'text-emerald-400'
                }`} />
                <input
                  type="email"
                  name="from_email"
                  required
                  placeholder="e.g. contact@company.com"
                  className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs transition-all ${
                    formTheme === 'light'
                      ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                formTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
              }`}>
                Message / Opportunity Overview
              </label>
              <div className="relative">
                <MessageSquare className={`absolute left-3.5 top-3 h-4 w-4 ${
                  formTheme === 'light' ? 'text-slate-400' : 'text-emerald-400'
                }`} />
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Share details regarding engineering roles, AI research collaborations, or technical questions..."
                  className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs resize-none transition-all ${
                    formTheme === 'light'
                      ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-300 hover:to-amber-500 hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Transmit Direct Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
