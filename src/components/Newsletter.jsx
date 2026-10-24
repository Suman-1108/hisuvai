import React, { useState } from 'react';
import { BookOpen, CheckCircle, Mail, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setSubscribed(true);
    addToast('Success! Your free Recipe Book is ready for download.', 'success');
  };

  return (
    <div className="bg-gradient-to-b from-[#F2EDE0] to-cream rounded-3xl p-8 sm:p-12 border border-cream-300 text-center max-w-4xl mx-auto shadow-soft relative overflow-hidden">
      
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-forest-900 text-gold flex items-center justify-center mx-auto mb-4 shadow-sm">
        <BookOpen className="w-7 h-7" />
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-900 leading-tight">
        Receive Grandma's Traditional Porridge & Kanji Recipe Book
      </h2>

      <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl mx-auto leading-relaxed">
        Get our complimentary 25-page digital recipe e-guide featuring seasonal breakfast kanji, preparation tricks, medicinal herbs, and easy-to-digest Ayurvedic broths.
      </p>

      {subscribed ? (
        <div className="mt-6 bg-forest-900 text-cream p-5 rounded-2xl max-w-md mx-auto flex items-center gap-3 border border-gold/40 shadow-sm animate-fade-in">
          <CheckCircle className="w-6 h-6 text-gold shrink-0" />
          <div className="text-left">
            <h4 className="font-bold text-sm text-gold">Check your inbox!</h4>
            <p className="text-xs text-cream-200 mt-0.5">
              We've sent the recipe book download link to <strong>{email}</strong>.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full bg-white text-gray-800 placeholder-gray-500 text-sm pl-11 pr-4 py-3.5 rounded-full border border-forest/20 focus:outline-none focus:ring-2 focus:ring-forest/50 transition-all shadow-xs"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-forest hover:bg-forest-800 text-cream font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Get Free Guide</span>
          </button>
        </form>
      )}

      <p className="text-[11px] text-gray-500 mt-4">
        Zero spam. You can unsubscribe anytime with a single click.
      </p>
    </div>
  );
}
