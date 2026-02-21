import { Check, Building2, Target, FileText, CalendarClock, UserCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = [
  { label: 'Organization', icon: Building2 },
  { label: 'Focus', icon: Target },
  { label: 'Objectives', icon: FileText },
  { label: 'Scope', icon: CalendarClock },
  { label: 'Contact', icon: UserCircle },
];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <>
      <div className="hidden sm:flex items-center gap-1">
        {STEPS.slice(0, totalSteps).map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-navy-800 text-white'
                      : isCurrent
                        ? 'bg-brand-500 text-white ring-[3px] ring-brand-500/15'
                        : 'bg-navy-100 text-navy-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-navy-900'
                      : isCompleted
                        ? 'text-navy-600'
                        : 'text-navy-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < totalSteps - 1 && (
                <div className="flex-1 mx-3">
                  <div className="h-[2px] rounded-full overflow-hidden bg-navy-100">
                    <div
                      className="h-full bg-navy-700 rounded-full transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sm:hidden flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
          {currentStep}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy-800">
            {STEPS[currentStep - 1].label}
          </p>
          <p className="text-[11px] text-navy-400">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <div className="flex gap-1">
          {STEPS.slice(0, totalSteps).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 === currentStep
                  ? 'w-5 bg-brand-500'
                  : i + 1 < currentStep
                    ? 'w-5 bg-navy-700'
                    : 'w-1.5 bg-navy-200'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
