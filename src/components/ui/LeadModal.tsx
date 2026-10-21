import React, { useEffect } from 'react';
import { X, ArrowUpRight, Mail, Phone } from 'lucide-react';

export interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<any>;
}

/**
 * Lead Intake Modal Wrapper (Milestone 1 accessible baseline)
 * WAI-ARIA compliant: role="dialog", aria-modal="true", Escape key dismissal, backdrop dismiss, body scroll lock.
 * Expanded in Milestone 4 to include the full 7-field form and calculator state handoff.
 */
export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-lead-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#f1f1f1] border border-[#e2e2e2] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4778]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#fc4778]" />
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1a1a1a]/65 font-medium tabular-nums">
            SALAH STUDIO INQUIRY
          </span>
        </div>

        <h3
          id="modal-lead-title"
          className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#1a1a1a] mb-2"
        >
          Start a conversation
        </h3>
        <p className="text-sm text-[#1a1a1a]/75 mb-6 font-sans leading-relaxed">
          Discuss an upcoming project, request dedicated capacity, or explore high-converting 3D
          web experiences.
        </p>

        {/* Quick Contact Links */}
        <div className="flex flex-col gap-3 mb-6">
          <a
            href="mailto:salauddin142008@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Salah"
            className="flex items-center justify-between p-4 rounded-xl border border-[#e2e2e2] bg-[#fafafa] hover:border-[#1a1a1a]/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#fc4778]" />
              <div>
                <div className="font-display font-semibold text-sm text-[#1a1a1a] tracking-tight">Send an Email</div>
                <div className="font-mono text-xs text-[#1a1a1a]/65 tabular-nums font-medium">salauddin142008@gmail.com</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#fc4778] transition-colors" />
          </a>

          <a
            href="https://wa.me/919790094500"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-[#e2e2e2] bg-[#fafafa] hover:border-[#1a1a1a]/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#fc4778]" />
              <div>
                <div className="font-display font-semibold text-sm text-[#1a1a1a] tracking-tight">WhatsApp Direct</div>
                <div className="font-mono text-xs text-[#1a1a1a]/65 tabular-nums font-medium">+91 97900 94500</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#fc4778] transition-colors" />
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-colors"
        >
          Return to Studio
        </button>
      </div>
    </div>
  );
};
