import type { FormData, StepErrors } from '../../types/form';
import SearchableSelect from '../SearchableSelect';
import { countries } from '../../data/countries';

interface Props {
  formData: FormData;
  errors: StepErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

const INDUSTRIES = [
  'Government & Public Sector',
  'International Development',
  'Education & Research',
  'Healthcare & Public Health',
  'Financial Services',
  'Non-Profit & NGO',
  'Energy & Infrastructure',
  'Technology & Digital',
  'Agriculture & Environment',
  'Other (Specify)',
];

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1,000',
  '1,001-5,000',
  '5,000+',
];

export default function OrganizationInfo({ formData, errors, onChange }: Props) {
  return (
    <div className="space-y-5 step-transition">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Organization Information</h2>
        <p className="text-sm text-navy-500 mt-1">
          Tell us about your organization so we can tailor our consultation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Organization Name <span className="text-brand-500">*</span>
        </label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => onChange('organizationName', e.target.value)}
          placeholder="e.g. Ministry of Education"
          className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 transition-colors ${
            errors.organizationName
              ? 'border-error-400 ring-1 ring-error-200'
              : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
          }`}
        />
        {errors.organizationName && (
          <p className="mt-1 text-sm text-error-500">{errors.organizationName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Industry / Sector
        </label>
        <select
          value={formData.industry}
          onChange={(e) => onChange('industry', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors appearance-none"
        >
          <option value="">Select an industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {formData.industry === 'Other (Specify)' && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-navy-700 mb-1.5">
            Specify Industry
          </label>
          <input
            type="text"
            value={formData.industryOther}
            onChange={(e) => onChange('industryOther', e.target.value)}
            placeholder="Enter your industry"
            className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
          />
        </div>
      )}

      <SearchableSelect
        label="Country"
        options={countries}
        value={formData.country}
        onChange={(val) => onChange('country', val)}
        placeholder="Select a country"
      />

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://example.org"
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Number of Employees
        </label>
        <select
          value={formData.employees}
          onChange={(e) => onChange('employees', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors appearance-none"
        >
          <option value="">Select range</option>
          {EMPLOYEE_RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
