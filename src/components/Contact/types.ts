export type CustomerType = 'private' | 'business';

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormProps {
  errors: ValidationErrors;
}
