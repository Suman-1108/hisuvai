import React from 'react';
import ContactForm from '../components/ContactForm';
import { MessageSquare, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-cream-200 text-forest-900 text-xs font-semibold px-4 py-1.5 rounded-full border border-forest/20">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>We're Here For You</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-forest-900 leading-tight">
          Get in Touch with HISUVAI
        </h1>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          Whether you want recipe tips, customized diet blends, bulk corporate gifting, or support with your recent pantry order, we're always delighted to connect.
        </p>
      </div>

      {/* Main Contact Form & FAQs */}
      <ContactForm />

    </div>
  );
}
