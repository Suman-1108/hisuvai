import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Phone, Mail, MapPin, Clock, MessageSquare, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { faqList } from '../data/products';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const { addToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please provide your name.';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Please provide a valid email.';
    if (!formData.phone.trim() || formData.phone.length < 10) errs.phone = 'Please enter a valid 10-digit phone number.';
    if (!formData.message.trim() || formData.message.length < 10) errs.message = 'Please enter at least 10 characters for your message.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    setErrors({});
    setSubmitted(true);
    addToast('Your message has been captured in our frontend prototype!', 'success');
  };

  return (
    <div className="space-y-16">
      
      {/* Contact Grid: Form & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-soft">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-8 leading-relaxed">
            Have questions about grain sprouting, ingredients, or custom family bundles? Our nutrition team responds promptly.
          </p>

          {submitted ? (
            <div className="bg-forest-50 border border-forest/30 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-forest text-gold rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest-900">
                Thank You, {formData.name}!
              </h3>
              <p className="text-xs text-gray-700 max-w-sm mx-auto leading-relaxed">
                Your message regarding <strong>"{formData.subject}"</strong> has been recorded in our frontend prototype state.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      subject: 'General Inquiry',
                      message: ''
                    });
                  }}
                  className="bg-forest hover:bg-forest-800 text-cream px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Sundaram"
                    className={`w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                      errors.name ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-cream-300 focus:border-forest'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className={`w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                      errors.phone ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-cream-300 focus:border-forest'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Email & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className={`w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                      errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-cream-300 focus:border-forest'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-forest"
                  >
                    <option value="General Inquiry">General Nutrition Inquiry</option>
                    <option value="Bulk Order">Bulk Family / Corporate Gifting</option>
                    <option value="Ingredient Queries">Sprouting & Ingredient Queries</option>
                    <option value="Order Tracking">Order & Delivery Assistance</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Your Message *
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you'd like to ask or feedback about our health mix..."
                  className={`w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                    errors.message ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-cream-300 focus:border-forest'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-forest hover:bg-forest-800 text-cream py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4 text-gold" />
                <span>Submit Message</span>
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                * Note: Frontend demonstration form. No external network request or real email sent.
              </p>
            </form>
          )}
        </div>

        {/* Right Column: Contact Cards & WhatsApp (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WhatsApp Direct Help Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-forest rounded-3xl p-6 sm:p-8 text-cream shadow-soft border border-emerald-700/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">
              Instant WhatsApp Support
            </h3>
            <p className="text-xs text-cream-200 mt-2 leading-relaxed">
              Prefer quick answers? Chat directly with our customer care and nutrition advisors on WhatsApp between 9:00 AM – 7:00 PM IST.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hello%20HISUVAI%2C%20I%20have%20an%20inquiry%20regarding%20traditional%20health%20mix"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Chat on WhatsApp</span>
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>

          {/* Contact Details List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-5 text-xs text-gray-700">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-forest shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-gray-900 text-sm">Milling & Heritage Facility</strong>
                <p className="text-gray-600 mt-0.5">
                  HISUVAI Foods, 14/2 Traditional Mills Road, Near Meenakshi Temple Agro Belt, Madurai, Tamil Nadu 625001, India.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-forest shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-gray-900 text-sm">Email Inquiries</strong>
                <a href="mailto:care@hisuvai.com" className="text-forest hover:underline">
                  care@hisuvai.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-forest shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-gray-900 text-sm">Customer Helpline</strong>
                <a href="tel:+919876543210" className="text-forest hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-forest shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-gray-900 text-sm">Working Hours</strong>
                <p className="text-gray-600 mt-0.5">Monday to Saturday: 8:30 AM – 7:30 PM</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-soft">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-earth uppercase tracking-widest block mb-1">
            Clear & Honest Answers
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-cream-300">
          {faqList.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-serif font-bold text-base sm:text-lg text-forest-900 hover:text-forest transition-colors gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-forest shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180 text-gold' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pl-1 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
