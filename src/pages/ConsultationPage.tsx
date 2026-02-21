import { Clock, Shield, Mail, ArrowRight } from 'lucide-react';
import ConsultationForm from '../components/ConsultationForm';

function InfoCard({ icon: Icon, title, description }: { icon: typeof Clock; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-navy-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-800">{title}</p>
        <p className="text-xs text-navy-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-widest mb-1">How It Works</p>
            <h3 className="text-base font-bold text-navy-900">What to Expect</h3>
          </div>

          <div className="space-y-4">
            <InfoCard icon={Clock} title="24-48 Hour Response" description="Our team reviews every submission personally." />
            <InfoCard icon={Shield} title="Strictly Confidential" description="All information is protected under our NDA framework." />
            <InfoCard icon={Mail} title="Direct Contact" description="beehiveassociates@gmail.com" />
          </div>

          <div className="h-px bg-navy-100" />

          <div className="relative overflow-hidden rounded-xl bg-navy-900 p-5">
            <p className="relative text-sm font-semibold text-white mb-1.5">Prefer to talk first?</p>
            <p className="relative text-xs text-navy-300 leading-relaxed mb-3">
              Schedule a no-obligation discovery call with one of our senior advisors.
            </p>
            <a
              href="mailto:beehiveassociates@gmail.com"
              className="relative inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Get in touch
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <main className="flex-1">
      <div className="relative bg-navy-900 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-700 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div
            className="inline-flex items-center gap-2 mb-4 animate-fade-in-up"
          >
            <div className="w-1 h-4 rounded-full bg-brand-500" />
            <p className="text-xs font-semibold text-navy-300 uppercase tracking-widest">Strategic Engagement</p>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight animate-fade-in-up"
            style={{ animationDelay: '80ms', animationFillMode: 'both' }}
          >
            Request a Consultation
          </h1>
          <p
            className="text-navy-400 mt-3 max-w-xl text-sm sm:text-base leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '160ms', animationFillMode: 'both' }}
          >
            Complete the form below to help us understand your institution's needs.
            Our advisory team will prepare a tailored response.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="lg:hidden mb-6">
          <div className="rounded-xl border border-navy-100 bg-white p-4 sm:p-5 space-y-4">
            <InfoCard icon={Clock} title="24-48 Hour Response" description="Our team reviews every submission personally." />
            <InfoCard icon={Shield} title="Strictly Confidential" description="Protected under our NDA framework." />
            <InfoCard icon={Mail} title="Direct Contact" description="beehiveassociates@gmail.com" />
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 animate-fade-in-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <ConsultationForm />
          <Sidebar />
        </div>
      </div>
    </main>
  );
}
