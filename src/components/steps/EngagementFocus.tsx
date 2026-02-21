import { GraduationCap, Building, Landmark, Compass, BarChart3, Shapes } from 'lucide-react';
import type { FormData, StepErrors } from '../../types/form';

interface Props {
  formData: FormData;
  errors: StepErrors;
  onChange: (field: keyof FormData, value: string | string[]) => void;
}

const SERVICE_OPTIONS = [
  { id: 'training', label: 'Training & Capacity Building', icon: GraduationCap },
  { id: 'advisory', label: 'Organizational Advisory', icon: Building },
  { id: 'governance', label: 'Governance & Compliance', icon: Landmark },
  { id: 'strategy', label: 'Strategic Planning', icon: Compass },
  { id: 'me', label: 'Monitoring & Evaluation', icon: BarChart3 },
  { id: 'other', label: 'Other (Specify)', icon: Shapes },
];

export default function EngagementFocus({ formData, errors, onChange }: Props) {
  function toggleService(id: string) {
    const current = formData.serviceAreas;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    onChange('serviceAreas', updated);
  }

  return (
    <div className="space-y-5 step-transition">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Engagement Focus</h2>
        <p className="text-sm text-navy-500 mt-1">
          Select the areas where you need strategic support. Choose all that apply.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICE_OPTIONS.map(({ id, label, icon: Icon }) => {
          const isSelected = formData.serviceAreas.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleService(id)}
              className={`relative flex items-center gap-3.5 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-navy-800 bg-navy-50 shadow-sm'
                  : 'border-navy-150 bg-white hover:border-navy-200 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-navy-800 text-white' : 'bg-navy-100 text-navy-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-navy-900' : 'text-navy-600'
                }`}
              >
                {label}
              </span>
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-navy-800 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {errors.serviceAreas && (
        <p className="text-sm text-error-500">{errors.serviceAreas}</p>
      )}

      {formData.serviceAreas.includes('other') && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-navy-700 mb-1.5">
            Please specify
          </label>
          <input
            type="text"
            value={formData.serviceAreaOther}
            onChange={(e) => onChange('serviceAreaOther', e.target.value)}
            placeholder="Describe the service area"
            className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
