import type { FormData, StepErrors } from '../../types/form';

interface Props {
  formData: FormData;
  errors: StepErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function InstitutionalObjectives({ formData, errors, onChange }: Props) {
  return (
    <div className="space-y-5 step-transition">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Institutional Objectives</h2>
        <p className="text-sm text-navy-500 mt-1">
          Help us understand the challenges you face and the outcomes you seek.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Key Challenge <span className="text-brand-500">*</span>
        </label>
        <textarea
          value={formData.keyChallenge}
          onChange={(e) => onChange('keyChallenge', e.target.value)}
          placeholder="Describe the primary challenge or issue your organization is facing..."
          rows={4}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 resize-none transition-colors ${
            errors.keyChallenge
              ? 'border-error-400 ring-1 ring-error-200'
              : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
          }`}
        />
        {errors.keyChallenge && (
          <p className="mt-1 text-sm text-error-500">{errors.keyChallenge}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Desired Outcome <span className="text-brand-500">*</span>
        </label>
        <textarea
          value={formData.desiredOutcome}
          onChange={(e) => onChange('desiredOutcome', e.target.value)}
          placeholder="What does a successful engagement look like for your organization?"
          rows={4}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 resize-none transition-colors ${
            errors.desiredOutcome
              ? 'border-error-400 ring-1 ring-error-200'
              : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
          }`}
        />
        {errors.desiredOutcome && (
          <p className="mt-1 text-sm text-error-500">{errors.desiredOutcome}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Broader Reform Context
        </label>
        <textarea
          value={formData.reformContext}
          onChange={(e) => onChange('reformContext', e.target.value)}
          placeholder="Is this engagement part of a broader reform or transformation initiative? (optional)"
          rows={3}
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 resize-none hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
        />
      </div>
    </div>
  );
}
