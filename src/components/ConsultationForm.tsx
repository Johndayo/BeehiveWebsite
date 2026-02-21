import { useState } from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { initialFormData } from '../types/form';
import type { FormData, StepErrors } from '../types/form';
import ProgressBar from './ProgressBar';
import StepIndicator from './StepIndicator';
import SuccessView from './SuccessView';
import OrganizationInfo from './steps/OrganizationInfo';
import EngagementFocus from './steps/EngagementFocus';
import InstitutionalObjectives from './steps/InstitutionalObjectives';
import ScopeTimeline from './steps/ScopeTimeline';
import DecisionProcess from './steps/DecisionProcess';

const TOTAL_STEPS = 5;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStep(step: number, formData: FormData): StepErrors {
  const errors: StepErrors = {};

  switch (step) {
    case 1:
      if (!formData.organizationName.trim()) {
        errors.organizationName = 'Organization name is required';
      }
      break;
    case 2:
      if (formData.serviceAreas.length === 0) {
        errors.serviceAreas = 'Please select at least one engagement area';
      }
      break;
    case 3:
      if (!formData.keyChallenge.trim()) {
        errors.keyChallenge = 'Please describe the key challenge';
      }
      if (!formData.desiredOutcome.trim()) {
        errors.desiredOutcome = 'Please describe the desired outcome';
      }
      break;
    case 4:
      if (!formData.budgetApproved) {
        errors.budgetApproved = 'Please indicate budget status';
      }
      break;
    case 5:
      if (!formData.contactName.trim()) {
        errors.contactName = 'Full name is required';
      }
      if (!formData.contactEmail.trim()) {
        errors.contactEmail = 'Email address is required';
      } else if (!validateEmail(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      }
      break;
  }

  return errors;
}

export default function ConsultationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(field: keyof FormData, value: string | string[]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleNext() {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      organization_name: formData.organizationName.trim(),
      industry: formData.industry,
      industry_other: formData.industryOther.trim(),
      country: formData.country,
      website: formData.website.trim(),
      employees: formData.employees,
      service_areas: formData.serviceAreas,
      service_area_other: formData.serviceAreaOther.trim(),
      key_challenge: formData.keyChallenge.trim(),
      desired_outcome: formData.desiredOutcome.trim(),
      reform_context: formData.reformContext.trim(),
      start_date: formData.startDate,
      timeline: formData.timeline,
      budget_approved: formData.budgetApproved,
      contact_name: formData.contactName.trim(),
      contact_email: formData.contactEmail.trim(),
      contact_phone: formData.contactPhone.trim(),
      contact_role: formData.contactRole.trim(),
      approvers: formData.approvers.trim(),
      partners: formData.partners.trim(),
    };

    try {
      const sheetsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-sheets`;
      const res = await fetch(sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || 'Something went wrong. Please try again or contact us directly.';
        setIsSubmitting(false);
        setSubmitError(msg);
        return;
      }
    } catch {
      setIsSubmitting(false);
      setSubmitError('Something went wrong. Please try again or contact us directly.');
      return;
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  function handleReset() {
    setFormData(initialFormData);
    setCurrentStep(1);
    setErrors({});
    setSubmitError('');
    setIsSubmitted(false);
  }

  if (isSubmitted) {
    return <SuccessView onReset={handleReset} />;
  }

  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="bg-white rounded-2xl border border-navy-100 p-4 sm:p-6 space-y-4 sm:space-y-5">
        <ProgressBar formData={formData} />
        <div className="h-px bg-navy-100" />
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      <div className="bg-white rounded-2xl border border-navy-100 p-5 sm:p-8">
        {currentStep === 1 && (
          <OrganizationInfo formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 2 && (
          <EngagementFocus formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 3 && (
          <InstitutionalObjectives formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 4 && (
          <ScopeTimeline formData={formData} errors={errors} onChange={handleChange} />
        )}
        {currentStep === 5 && (
          <DecisionProcess formData={formData} errors={errors} onChange={handleChange} />
        )}

        {submitError && (
          <div className="mt-4 p-3.5 bg-error-50 border border-error-200 rounded-xl">
            <p className="text-sm text-error-600">{submitError}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-navy-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 text-sm font-medium text-navy-600 bg-navy-50 rounded-xl hover:bg-navy-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 text-sm font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Enquiry
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 text-sm font-semibold text-white bg-navy-800 rounded-xl hover:bg-navy-900 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
