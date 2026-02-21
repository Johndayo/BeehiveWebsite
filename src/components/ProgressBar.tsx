import type { FormData } from '../types/form';

interface ProgressBarProps {
  formData: FormData;
}

const FIELD_WEIGHTS: { key: keyof FormData; weight: number; check: (val: unknown) => boolean }[] = [
  { key: 'organizationName', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'industry', weight: 6, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'country', weight: 6, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'website', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'employees', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'serviceAreas', weight: 10, check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'keyChallenge', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'desiredOutcome', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'reformContext', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'startDate', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'timeline', weight: 4, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'budgetApproved', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'contactName', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'contactEmail', weight: 10, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'contactPhone', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'contactRole', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'approvers', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
  { key: 'partners', weight: 3, check: (v) => typeof v === 'string' && v.trim().length > 0 },
];

export function calculateProgress(formData: FormData): number {
  const totalWeight = FIELD_WEIGHTS.reduce((sum, f) => sum + f.weight, 0);
  const earned = FIELD_WEIGHTS.reduce(
    (sum, f) => sum + (f.check(formData[f.key]) ? f.weight : 0),
    0,
  );
  return Math.round((earned / totalWeight) * 100);
}

export default function ProgressBar({ formData }: ProgressBarProps) {
  const percentage = calculateProgress(formData);
  const isComplete = percentage === 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
          Completion
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${
            isComplete ? 'text-success-600' : 'text-navy-700'
          }`}
        >
          {percentage}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-navy-100/80 rounded-full overflow-hidden">
        <div
          className={`progress-fill h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-success-400 to-success-500'
              : 'bg-gradient-to-r from-brand-400 to-brand-500'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Form completion: ${percentage}%`}
        />
      </div>
    </div>
  );
}
