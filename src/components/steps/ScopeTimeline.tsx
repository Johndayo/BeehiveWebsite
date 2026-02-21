import { CheckCircle2 } from 'lucide-react';
import type { FormData, StepErrors } from '../../types/form';

interface Props {
  formData: FormData;
  errors: StepErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

const TIMELINES = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '12+ months',
  'To be determined',
];

const BUDGET_OPTIONS = [
  { value: 'yes', label: 'Yes', description: 'Budget is approved and allocated' },
  { value: 'no', label: 'Not Yet', description: 'Budget has not been approved' },
  { value: 'in-review', label: 'In Review', description: 'Pending approval process' },
];

export default function ScopeTimeline({ formData, errors, onChange }: Props) {
  return (
    <div className="space-y-5 step-transition">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Scope & Timeline</h2>
        <p className="text-sm text-navy-500 mt-1">
          Provide details about your desired timeline and budget readiness.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Desired Start Date
        </label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Proposed Timeline
        </label>
        <select
          value={formData.timeline}
          onChange={(e) => onChange('timeline', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors appearance-none"
        >
          <option value="">Select a timeline</option>
          {TIMELINES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
          Budget Approved <span className="text-brand-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = formData.budgetApproved === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('budgetApproved', opt.value)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-navy-800 bg-navy-50 shadow-sm'
                    : 'border-navy-150 bg-white hover:border-navy-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-navy-800" />}
                  <span className={`text-sm font-semibold ${isSelected ? 'text-navy-900' : 'text-navy-700'}`}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-navy-500">{opt.description}</p>
              </button>
            );
          })}
        </div>
        {errors.budgetApproved && (
          <p className="mt-1 text-sm text-error-500">{errors.budgetApproved}</p>
        )}
      </div>
    </div>
  );
}
