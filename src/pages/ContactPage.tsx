import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, Mail, MessageSquare, Phone, Clock, ArrowUpRight } from 'lucide-react';
import { LeadIntakeFormData } from '../types';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Extract query parameters for prefill
  const paramScope = searchParams.get('scope') || 'landing';
  const paramBudget = searchParams.get('budget') || '1.5l-3l';
  const paramUrgency = searchParams.get('urgency') || 'standard';

  const [formData, setFormData] = useState<LeadIntakeFormData>({
    name: '',
    email: '',
    companyUrl: '',
    scope: paramScope,
    budget: paramBudget,
    timeline: paramUrgency,
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof LeadIntakeFormData, string>>>({});

  // Sync state if query params change
  useEffect(() => {
    if (searchParams.get('scope')) {
      setFormData((prev) => ({ ...prev, scope: searchParams.get('scope')! }));
    }
    if (searchParams.get('budget')) {
      setFormData((prev) => ({ ...prev, budget: searchParams.get('budget')! }));
    }
    if (searchParams.get('urgency')) {
      setFormData((prev) => ({ ...prev, timeline: searchParams.get('urgency')! }));
    }
  }, [searchParams]);

  const SCOPE_OPTIONS = [
    { id: 'landing', label: 'Landing Page' },
    { id: 'multipage', label: 'Multi-Page Site' },
    { id: '3d-app', label: '3D Web App / Experience' },
    { id: 'retainer', label: 'Dedicated Retainer' }
  ];

  const BUDGET_BRACKETS = [
    { id: 'under-1.5l', label: '< ₹1.5L' },
    { id: '1.5l-3l', label: '₹1.5L — ₹3L' },
    { id: '3l-5l', label: '₹3L — ₹5L' },
    { id: '5l+', label: '₹5L+' }
  ];

  const TIMELINE_OPTIONS = [
    { id: 'rush', label: 'Rush / Priority Sprint (< 3 weeks)' },
    { id: 'standard', label: 'Standard Delivery (3–6 weeks)' },
    { id: 'flexible', label: 'Flexible / Q3–Q4 Planning' }
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LeadIntakeFormData, string>> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid work email address.';
    }

    if (formData.companyUrl && formData.companyUrl.trim().length > 0) {
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
      if (!urlPattern.test(formData.companyUrl.trim())) {
        newErrors.companyUrl = 'Please provide a valid URL (e.g. company.com or https://company.com).';
      }
    }

    if (!formData.scope) {
      newErrors.scope = 'Please select your project scope.';
    }

    if (!formData.budget) {
      newErrors.budget = 'Please select a budget bracket in INR (₹).';
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Please indicate your expected delivery timeline.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide project details (minimum 10 characters).';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be under 2000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    // Simulated network transmission in development mode
    setTimeout(() => {
      setStatus('success');
    }, 600);
  };

  return (
    <article className="min-h-screen py-16 sm:py-24 selection:bg-[#fc4778]/20 selection:text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Page Header */}
        <header className="flex flex-col gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-[#1a1a1a]/65 font-medium tabular-nums">
            <span className="w-2 h-2 rounded-full bg-[#fc4778]" />
            <span>High-Ticket Inquiries · Direct Studio Intake</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-medium tracking-tight text-[#1a1a1a] leading-[0.95]">
            Initiate a Project
          </h1>
          <p className="font-sans text-lg sm:text-xl text-[#1a1a1a]/80 max-w-2xl text-pretty">
            Tell us about your objectives, timeline, and scope. We review every brief personally and respond within 24 hours.
          </p>
        </header>

        {/* Dual-Column Layout: Direct Reach-outs & High-Ticket Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Reach-Out Channels */}
          <aside className="lg:col-span-5 flex flex-col gap-8">
            <div className="p-8 rounded-3xl border border-[#e2e2e2] bg-[#fafafa] flex flex-col gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778] font-medium tabular-nums">
                [ Instant Channels ]
              </span>
              <h2 className="font-display text-2xl font-medium text-[#1a1a1a] tracking-tight">
                Prefer a direct conversation?
              </h2>

              <div className="flex flex-col gap-4 pt-2">
                <a
                  href="mailto:salauddin142008@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Salah"
                  className="flex items-center justify-between p-4 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] hover:border-[#fc4778] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#fc4778]" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase text-[#1a1a1a]/55 font-medium tabular-nums">Email Reach-out</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-[#1a1a1a]">salauddin142008@gmail.com</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#fc4778] transition-colors" />
                </a>

                <a
                  href="https://wa.me/919790094500?text=Hi%20Salah,%20I%20would%20like%20to%20discuss%20a%20new%20project%20commission."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] hover:border-[#fc4778] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-[#fc4778]" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase text-[#1a1a1a]/55 font-medium tabular-nums">WhatsApp Direct</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-[#1a1a1a] tabular-nums">+91 97900 94500</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#fc4778] transition-colors" />
                </a>

                <a
                  href="tel:+919790094500"
                  className="flex items-center justify-between p-4 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] hover:border-[#fc4778] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#fc4778]" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase text-[#1a1a1a]/55 font-medium tabular-nums">Direct Line</span>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-[#1a1a1a] tabular-nums">+91 97900 94500</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#fc4778] transition-colors" />
                </a>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-[#e2e2e2] flex items-center justify-between">
                <a
                  href="https://github.com/salah1402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#1a1a1a]/70 hover:text-[#fc4778] font-medium"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/mohamed-salauddin-a-b124593b1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#1a1a1a]/70 hover:text-[#fc4778] font-medium"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Studio Coordinates Card */}
            <div className="p-8 rounded-3xl bg-[#1a1a1a] text-[#f1f1f1] flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#fc4778] font-medium tabular-nums">
                Studio Location
              </span>
              <h3 className="font-display text-xl font-medium tracking-tight">
                Thanjavur, Tamil Nadu, India
              </h3>
              <p className="font-sans text-xs text-[#f1f1f1]/75 leading-relaxed">
                Operating on Indian Standard Time (IST, UTC+05:30). Client consultations scheduled worldwide across US, UK, and European timezones.
              </p>
              <div className="pt-2 flex items-center gap-2 font-mono text-xs text-[#fc4778] font-medium tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>Response SLA: &lt; 24 Hours</span>
              </div>
            </div>
          </aside>

          {/* Right Column: High-Ticket Interactive Intake Form */}
          <section className="lg:col-span-7 p-8 sm:p-12 rounded-3xl border border-[#e2e2e2] bg-[#fafafa] shadow-xs">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-[#fc4778] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-3xl font-medium text-[#1a1a1a]">
                  Inquiry Received
                </h3>
                <p className="font-sans text-base text-[#1a1a1a]/70 max-w-md">
                  Thank you for sharing your project brief. Salah will review your requirements and respond within 24 hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://wa.me/919790094500?text=Hi%20Salah,%20I%20just%20submitted%20a%20project%20inquiry%20for%20${encodeURIComponent(formData.name)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-colors"
                  >
                    Send Instant WhatsApp Follow-up ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setFormData({
                        name: '',
                        email: '',
                        companyUrl: '',
                        scope: 'landing',
                        budget: '1.5l-3l',
                        timeline: 'standard',
                        message: ''
                      });
                    }}
                    className="px-6 py-3 rounded-full border border-[#e2e2e2] bg-[#f1f1f1] font-mono text-xs uppercase tracking-wider text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                  >
                    Submit Another Brief
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                {/* Scope Selector */}
                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold tabular-nums">
                    01. Project Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, scope: opt.id })}
                        className={`p-3.5 rounded-xl border font-mono text-xs text-left font-medium tabular-nums transition-all ${
                          formData.scope === opt.id
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]'
                            : 'border-[#e2e2e2] bg-[#f1f1f1] text-[#1a1a1a] hover:border-[#1a1a1a]/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.scope && (
                    <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.scope}
                    </span>
                  )}
                </div>

                {/* Budget Selector */}
                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold tabular-nums">
                    02. Anticipated Budget (INR ₹)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BUDGET_BRACKETS.map((bracket) => (
                      <button
                        type="button"
                        key={bracket.id}
                        onClick={() => setFormData({ ...formData, budget: bracket.id })}
                        className={`p-3.5 rounded-xl border font-mono text-xs text-center font-medium tabular-nums transition-all ${
                          formData.budget === bracket.id
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]'
                            : 'border-[#e2e2e2] bg-[#f1f1f1] text-[#1a1a1a] hover:border-[#1a1a1a]/40'
                        }`}
                      >
                        {bracket.label}
                      </button>
                    ))}
                  </div>
                  {errors.budget && (
                    <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.budget}
                    </span>
                  )}
                </div>

                {/* Timeline Urgency */}
                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold tabular-nums">
                    03. Timeline Urgency
                  </label>
                  <div className="flex flex-col gap-2">
                    {TIMELINE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, timeline: opt.id })}
                        className={`p-3 rounded-xl border font-mono text-xs text-left font-medium tabular-nums transition-all ${
                          formData.timeline === opt.id
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]'
                            : 'border-[#e2e2e2] bg-[#f1f1f1] text-[#1a1a1a] hover:border-[#1a1a1a]/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.timeline && (
                    <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.timeline}
                    </span>
                  )}
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-medium">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Mohamed Salauddin"
                      className="px-4 py-3 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] font-sans text-sm text-[#1a1a1a] focus:outline-none focus:border-[#fc4778]"
                    />
                    {errors.name && (
                      <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-medium">
                      Work Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@company.com"
                      className="px-4 py-3 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] font-sans text-sm text-[#1a1a1a] focus:outline-none focus:border-[#fc4778]"
                    />
                    {errors.email && (
                      <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Company URL (Optional) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="companyUrl" className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-medium">
                    Company / Existing Website (Optional)
                  </label>
                  <input
                    id="companyUrl"
                    type="url"
                    value={formData.companyUrl}
                    onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                    placeholder="https://company.com"
                    className="px-4 py-3 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] font-sans text-sm text-[#1a1a1a] focus:outline-none focus:border-[#fc4778]"
                  />
                  {errors.companyUrl && (
                    <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.companyUrl}
                    </span>
                  )}
                </div>

                {/* Message Field */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="message" className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-medium">
                      Project Brief &amp; Goals *
                    </label>
                    <span className="font-mono text-[10.5px] text-[#1a1a1a]/45 tabular-nums font-medium">
                      {formData.message.length} / 2000
                    </span>
                  </div>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide a brief summary of what you are aiming to build, key conversion milestones, and existing assets..."
                    className="px-4 py-3 rounded-xl border border-[#e2e2e2] bg-[#f1f1f1] font-sans text-sm text-[#1a1a1a] focus:outline-none focus:border-[#fc4778]"
                  />
                  {errors.message && (
                    <span className="font-sans text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Trigger */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-all disabled:opacity-50"
                >
                  {status === 'submitting' ? (
                    <span>Transmitting Brief...</span>
                  ) : (
                    <>
                      <span>Transmit Project Brief</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </article>
  );
};
