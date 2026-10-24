import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function OfferBanner() {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  // Fake countdown timer for harvest sale (keeps ticking down smoothly)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    mins: 36,
    secs: 42
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-900 via-forest to-earth text-cream p-6 sm:p-10 shadow-elevated border border-gold/30">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gold/10 pointer-events-none blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-forest-700/30 pointer-events-none blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Offer Details */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-gold/40 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Festival Harvest Festive Deal</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Grand Traditional Wellness Sale: <span className="text-gold">Up to 25% Off</span>
          </h2>

          <p className="text-sm sm:text-base text-cream-200 mt-2 max-w-xl">
            Stock your home pantry with stone-ground nutrition. Get complimentary cold-pressed almond oil sachet on family bundle orders.
          </p>
        </div>

        {/* Center: Countdown Timer */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
          <Clock className="w-5 h-5 text-gold shrink-0 hidden sm:block" />
          <div className="flex gap-2.5 text-center">
            <div className="flex flex-col">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white bg-forest-950/70 px-2.5 py-1 rounded-lg">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-cream-300 uppercase tracking-widest mt-1">Days</span>
            </div>
            <span className="text-gold font-bold text-xl self-center">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white bg-forest-950/70 px-2.5 py-1 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-cream-300 uppercase tracking-widest mt-1">Hours</span>
            </div>
            <span className="text-gold font-bold text-xl self-center">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white bg-forest-950/70 px-2.5 py-1 rounded-lg">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-cream-300 uppercase tracking-widest mt-1">Mins</span>
            </div>
            <span className="text-gold font-bold text-xl self-center">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white bg-forest-950/70 px-2.5 py-1 rounded-lg">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-cream-300 uppercase tracking-widest mt-1">Secs</span>
            </div>
          </div>
        </div>

        {/* Right: Coupon & CTA Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0">
          {/* Coupon Pill */}
          <div className="flex items-center gap-2 bg-white/10 border border-gold/40 px-3.5 py-2 rounded-xl text-xs font-mono">
            <span className="text-cream-300">CODE:</span>
            <strong className="text-gold font-bold text-sm tracking-wider">HISUVAI25</strong>
            <button
              onClick={() => handleCopyCode('HISUVAI25')}
              className="ml-1 p-1 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* CTA Link */}
          <Link
            to="/offers"
            className="bg-gold hover:bg-gold-500 text-forest-900 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>Claim Festive Offer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
