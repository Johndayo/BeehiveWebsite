import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { initialFormData } from '../types/form';
import type { FormData, StepErrors } from '../types/form';
import { apiClient } from '../lib/secure-api';
import { validator, sanitizer, validate } from '../lib/validation';
import { securityLogger, SecurityEventType, EventSeverity } from '../lib/monitoring/logger';
import ProgressBar from './ProgressBar';
import StepIndicator from './StepIndicator';
import SuccessView from './SuccessView';
import OrganizationInfo from './steps/OrganizationInfo';
import EngagementFocus from './steps/EngagementFocus';
import InstitutionalObjectives from './steps/InstitutionalObjectives';
import ScopeTimeline from './steps/ScopeTimeline';
import DecisionProcess from './steps/DecisionProcess';

const TOTAL_STEPS = 5;

/**
 * 🔒 Validates step data with enhanced security checks
 */
function validateStep(step: number, formData: FormData): StepErrors {
  const errors: StepErrors = {};

  switch (step) {
    case 1:
      {
        const orgName = sanitizer.sanitizeText(formData.organizationName);
        if (!validator.isValidText(orgName, 1, 200)) {
          errors.organizationName = 'Organization name is required (1-200 characters)';
          securityLogger.logInvalidInput('organizationName', 'Invalid length');
        }
      }
      break;
    case 2:
      if (formData.serviceAreas.length === 0) {
        errors.serviceAreas = 'Please select at least one engagement area';
        securityLogger.logInvalidInput('serviceAreas', 'No areas selected');
      }
      break;
    case 3:
      {
        const challenge = sanitizer.sanitizeText(formData.keyChallenge);
        const outcome = sanitizer.sanitizeText(formData.desiredOutcome);

        if (!validator.isValidText(challenge, 10, 2000)) {
          errors.keyChallenge = 'Please describe the key challenge (10-2000 characters)';
          securityLogger.logInvalidInput('keyChallenge', 'Invalid length');
        }
        if (!validator.isValidText(outcome, 10, 2000)) {
          errors.desiredOutcome = 'Please describe the desired outcome (10-2000 characters)';
          securityLogger.logInvalidInput('desiredOutcome', 'Invalid length');
        }
      }
      break;
    case 4:
      if (!formData.budgetApproved) {
        errors.budgetApproved = 'Please indicate budget status';
        securityLogger.logInvalidInput('budgetApproved', 'Not selected');
      }
      break;
    case 5:
      {
        const nameValidation = validate.name(formData.contactName);
        const emailValidation = validate.email(formData.contactEmail);
        const phoneValidation = validate.phone(formData.contactPhone);

        if (!nameValidation.valid) {
          errors.contactName = nameValidation.error || 'Invalid name';
          securityLogger.logInvalidInput('contactName', nameValidation.error || 'Invalid');
        }
        if (!emailValidation.valid) {
          errors.contactEmail = emailValidation.error || 'Invalid email';
          securityLogger.logInvalidInput('contactEmail', emailValidation.error || 'Invalid');
        }
        if (formData.contactPhone && !phoneValidation.valid) {
          errors.contactPhone = phoneValidation.error || 'Invalid phone';
          securityLogger.logInvalidInput('contactPhone', phoneValidation.error || 'Invalid');
        }
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

  function handleChange(field: keyof FormData, value: string | string[] | boolean) {
    let sanitizedValue: string | string[] | boolean = value;

    if (field === 'contactPhone') {
      const processedValue =
        typeof value === 'object' && value !== null && 'phone' in value
          ? (value as { phone?: unknown }).phone
          : value;

      if (typeof processedValue === 'string') {
        sanitizedValue = processedValue;
      } else {
        sanitizedValue = String(processedValue ?? '');
      }
    } else if (typeof value === 'string') {
      sanitizedValue = sanitizer.sanitizeText(value);
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue as any }));
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

    // 🔒 Sanitize all text fields and validate before submission
    const payload = {
      organization_name: sanitizer.sanitizeText(formData.organizationName).trim(),
      industry: sanitizer.sanitizeText(formData.industry).trim(),
      industry_other: sanitizer.sanitizeText(formData.industryOther).trim(),
      country: sanitizer.sanitizeText(formData.country).trim(),
      website: sanitizer.sanitizeUrl(formData.website.trim()),
      employees: sanitizer.sanitizeText(formData.employees).trim(),
      service_areas: formData.serviceAreas, // Already validated as array
      service_area_other: sanitizer.sanitizeText(formData.serviceAreaOther).trim(),
      key_challenge: sanitizer.sanitizeText(formData.keyChallenge).trim(),
      desired_outcome: sanitizer.sanitizeText(formData.desiredOutcome).trim(),
      reform_context: sanitizer.sanitizeText(formData.reformContext).trim(),
      start_date: formData.startDate, // Date already validated
      timeline: sanitizer.sanitizeText(formData.timeline).trim(),
      budget_approved: formData.budgetApproved,
      contact_name: sanitizer.sanitizeText(formData.contactName).trim(),
      contact_email: sanitizer.sanitizeEmail(formData.contactEmail.trim()),
      contact_phone: sanitizer.sanitizePhone(formData.contactPhone.trim()),
      contact_role: sanitizer.sanitizeText(formData.contactRole).trim(),
      approvers: sanitizer.sanitizeText(formData.approvers).trim(),
      partners: sanitizer.sanitizeText(formData.partners).trim(),
    };

    // 🔒 Final validation of critical fields
    const emailValidation = validate.email(payload.contact_email);
    if (!emailValidation.valid) {
      setIsSubmitting(false);
      const error = `Invalid email: ${emailValidation.error}`;
      setSubmitError(error);
      securityLogger.logInvalidInput('contactEmail', emailValidation.error || 'Invalid');
      return;
    }

    try {
      // ✅ Use secure backend API instead of direct Supabase call
      const result = await apiClient.submitConsultation(payload);

      if (!result.success) {
        const msg = result.message || 'Submission failed. Please try again.';
        setIsSubmitting(false);
        setSubmitError(msg);
        securityLogger.log(
          SecurityEventType.DATA_MODIFICATION,
          'Consultation form submission failed',
          'failure',
          EventSeverity.WARNING
        );
        return;
      }

      // 🔒 Log successful submission
      securityLogger.log(
        SecurityEventType.DATA_MODIFICATION,
        'Consultation form submitted successfully',
        'success',
        EventSeverity.INFO
      );
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setSubmitError(errorMessage);
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
