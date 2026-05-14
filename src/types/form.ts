export interface FormData {
  organizationName: string;
  industry: string;
  industryOther: string;
  country: string;
  website: string;
  employees: string;
  serviceAreas: string[];
  serviceAreaOther: string;
  keyChallenge: string;
  desiredOutcome: string;
  reformContext: string;
  startDate: string;
  timeline: string;
  budgetApproved: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  approvers: string;
  partners: string;
}

export const initialFormData: FormData = {
  organizationName: '',
  industry: '',
  industryOther: '',
  country: '',
  website: '',
  employees: '',
  serviceAreas: [],
  serviceAreaOther: '',
  keyChallenge: '',
  desiredOutcome: '',
  reformContext: '',
  startDate: '',
  timeline: '',
  budgetApproved: false,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactRole: '',
  approvers: '',
  partners: '',
};

export interface StepErrors {
  [key: string]: string;
}
