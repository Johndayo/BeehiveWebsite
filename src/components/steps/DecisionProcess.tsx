import { useState } from 'react';
import { AlertCircle, Phone } from 'lucide-react';
import type { FormData, StepErrors } from '../../types/form';
import { countryDialCodes } from '../../data/countryCodes';

interface Props {
  formData: FormData;
  errors: StepErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-().+]/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
}

export default function DecisionProcess({ formData, errors, onChange }: Props) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const emailValue = formData.contactEmail.trim();
  const showEmailError =
    emailTouched && emailValue.length > 0 && !isValidEmail(emailValue);

  const phoneValue = formData.contactPhone.trim();
  const showPhoneError =
    phoneTouched && phoneValue.length > 0 && !isValidPhone(phoneValue);

  const suggestedCode = formData.country
    ? countryDialCodes[formData.country]
    : null;
  const showCodeHint =
    suggestedCode &&
    phoneValue.length === 0;

  function handleApplyCode() {
    onChange('contactPhone', suggestedCode + ' ');
  }

  return (
    <div className="space-y-6 step-transition">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Contact & Decision Process</h2>
        <p className="text-sm text-navy-500 mt-1">
          Provide your contact details and information about the decision-making process.
        </p>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wider">
          Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Full Name <span className="text-brand-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => onChange('contactName', e.target.value)}
              placeholder="John Smith"
              className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 transition-colors ${
                errors.contactName
                  ? 'border-error-400 ring-1 ring-error-200'
                  : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
              }`}
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-error-500">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Email Address <span className="text-brand-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="john@organization.org"
              className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 transition-colors ${
                errors.contactEmail || showEmailError
                  ? 'border-error-400 ring-1 ring-error-200'
                  : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
              }`}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-error-500">{errors.contactEmail}</p>
            )}
            {!errors.contactEmail && showEmailError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-error-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Please enter a valid email (e.g. name@company.com)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              placeholder={suggestedCode ? `${suggestedCode} ...` : '+1 (555) 000-0000'}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 transition-colors ${
                showPhoneError
                  ? 'border-error-400 ring-1 ring-error-200'
                  : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
              }`}
            />
            {showPhoneError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-error-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Please enter a valid phone number with country code
              </p>
            )}
            {showCodeHint && (
              <button
                type="button"
                onClick={handleApplyCode}
                className="mt-1.5 flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-700 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-navy-400 group-hover:text-navy-600 transition-colors" />
                Country code for {formData.country}:
                <span className="font-medium text-navy-700 bg-navy-50 px-1.5 py-0.5 rounded">
                  {suggestedCode}
                </span>
                <span className="text-xs text-navy-400 group-hover:text-brand-500 transition-colors">
                  click to apply
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Role / Title
            </label>
            <input
              type="text"
              value={formData.contactRole}
              onChange={(e) => onChange('contactRole', e.target.value)}
              placeholder="e.g. Director of Operations"
              className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-navy-100">
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wider">
            Decision Process
          </h3>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Key Approvers
            </label>
            <textarea
              value={formData.approvers}
              onChange={(e) => onChange('approvers', e.target.value)}
              placeholder="Who are the key decision-makers or approvers for this engagement? (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 resize-none hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              External Partners
            </label>
            <textarea
              value={formData.partners}
              onChange={(e) => onChange('partners', e.target.value)}
              placeholder="Are there any external partners or stakeholders involved? (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 resize-none hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
