import { ValidationErrors, CustomerType } from './types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Italian phone number validation (mobile and landline)
  const phoneRegex =
    /^(\+39\s?)?((3[0-9]{2}\s?\d{3}\s?\d{4})|(0[0-9]{1,3}\s?\d{3,4}\s?\d{3,4}))$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateVATNumber = (vat: string): boolean => {
  // Italian VAT number validation (11 digits)
  const vatRegex = /^[0-9]{11}$/;
  if (!vatRegex.test(vat)) return false;

  // Additional checksum validation for Italian VAT
  const digits = vat.split('').map((d) => parseInt(d, 10));
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

export const validateForm = (
  formData: FormData,
  activeTab: CustomerType
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

  if (activeTab === 'business') {
    const vatNumber = formData.get('vat_number') as string;
    if (vatNumber && !validateVATNumber(vatNumber)) {
      newErrors.vat_number =
        'Inserisci una Partita IVA italiana valida (11 cifre)';
    }
  }

  return newErrors;
};
