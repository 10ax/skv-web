// Contact-form validation, split out of src/components/Contact.tsx so the rules
// can be exercised without rendering the form.
//
// This is the second of two checks. The inputs themselves carry `required` and
// `pattern` attributes, so a browser blocks most bad input first; these
// functions run again in onSubmit and decide the Italian message shown under a
// field. Where the two disagree, the HTML attribute is the stricter one.

export type CustomerType = 'private' | 'business';

export interface ValidationErrors {
  [key: string]: string;
}

/** Same shape as the `pattern` attribute on the email input. */
export const validateEmail = (email: string): boolean => {
  if (/\s/.test(email)) return false;
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@') || at === email.length - 1) {
    return false;
  }
  const domain = email.slice(at + 1);
  const dot = domain.indexOf('.');
  return dot > 0 && dot < domain.length - 1;
};

/**
 * Italian phone number, simplified: optional +39 then 9-11 digits. Spaces and
 * hyphens are removed first; any other separator (a dot, a slash) is not, and
 * makes the number fail.
 */
export const validatePhone = (phone: string): boolean => {
  const normalizedPhone = phone.replaceAll(/[\s-]/g, '');
  const phoneRegex = /^(\+39)?\d{9,11}$/;
  return phoneRegex.test(normalizedPhone);
};

/**
 * Italian partita IVA: eleven digits whose last one is the Luhn check digit
 * over the first ten. Purely arithmetic — it proves the number is well formed,
 * not that it was ever issued.
 */
export const validateVATNumber = (vat: string): boolean => {
  const vatRegex = /^\d{11}$/;
  if (!vatRegex.test(vat)) return false;

  const digits = vat.split('').map((d) => Number.parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    const digit = digits[i];
    if (digit !== undefined) {
      const multiplier = i % 2 === 0 ? 1 : 2;
      let product = digit * multiplier;
      if (product > 9) {
        product -= 9;
      }
      sum += product;
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[10];
};

/**
 * Validate one submission of the contact form. Only fields the visitor
 * actually filled in are checked — an empty or absent field is the `required`
 * attribute's problem, not this function's — and the VAT number is only looked
 * at on the business tab, because the private form has no such input.
 */
export const validateContactForm = (
  formData: FormData,
  customerType: CustomerType
): ValidationErrors => {
  const newErrors: ValidationErrors = {};
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  if (email && !validateEmail(email)) {
    newErrors.email = 'Inserisci un indirizzo email valido';
  }

  if (phone && !validatePhone(phone)) {
    newErrors.phone = 'Inserisci un numero di telefono italiano valido';
  }

  if (customerType === 'business') {
    const vatNumber = formData.get('vat_number') as string;
    if (vatNumber && !validateVATNumber(vatNumber)) {
      newErrors.vat_number =
        'Inserisci una Partita IVA italiana valida (11 cifre)';
    }
  }

  return newErrors;
};
