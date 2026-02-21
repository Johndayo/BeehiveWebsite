import { CheckCircle2, Clock, Shield, Mail, ArrowRight } from 'lucide-react';

interface SuccessViewProps {
  onReset: () => void;
}

export default function SuccessView({ onReset }: SuccessViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] animate-fade-in-up">
      <div className="text-center max-w-md px-4">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 bg-success-200 rounded-full animate-pulse-ring" />
          <div className="relative w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success-500" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">
          Request Submitted
        </h2>
        <p className="text-sm text-navy-500 leading-relaxed mb-8">
          Thank you for your interest in working with Beehive Associates.
          Our team will review your submission and respond within 24-48 business hours.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Clock, label: '24-48 hr response' },
            { icon: Shield, label: 'Fully confidential' },
            { icon: Mail, label: 'Confirmation sent' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center p-3 bg-white rounded-xl border border-navy-100/80">
              <Icon className="w-4 h-4 text-navy-600 mb-1.5" />
              <span className="text-[11px] font-medium text-navy-600 leading-tight text-center">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-navy-800 text-white text-sm font-semibold rounded-xl hover:bg-navy-900 transition-colors"
        >
          Submit Another Enquiry
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
