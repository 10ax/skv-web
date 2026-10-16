import { describe, expect, it } from 'vitest';

import {
  validateContactForm,
  validateEmail,
  validatePhone,
  validateVATNumber,
} from '../src/utils/validation';

// The contact form is the only interactive part of the site. It validates in
// two independent places: the HTML `pattern`/`required` attributes on the
// inputs, and these functions, which run again in onSubmit before anything is
// posted to Web3Forms. These tests pin the JavaScript half.

describe('validateEmail', () => {
  it('accepts an address with a dot in the domain', () => {
    expect(validateEmail('mario.rossi@example.com')).toBe(true);
  });

  it('rejects what the matching HTML pattern also rejects', () => {
    expect(validateEmail('mario@example')).toBe(false);
    expect(validateEmail('mario@example.')).toBe(false);
    expect(validateEmail('mario rossi@example.com')).toBe(false);
    expect(validateEmail('mario@@example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepts Italian mobile and landline numbers, with or without +39', () => {
    expect(validatePhone('+39 377 357 5917')).toBe(true);
    expect(validatePhone('377 357 5917')).toBe(true);
    expect(validatePhone('3773575917')).toBe(true);
    expect(validatePhone('081 123 4567')).toBe(true);
  });

  it('strips spaces and hyphens before matching — but not dots', () => {
    expect(validatePhone('377-357-5917')).toBe(true);
    expect(validatePhone('377.357.5917')).toBe(false);
  });

  it('rejects a number that is too short, too long, or foreign', () => {
    expect(validatePhone('12345678')).toBe(false);
    expect(validatePhone('+39 377 357 59170000')).toBe(false);
    expect(validatePhone('+1 202 555 0143')).toBe(false);
  });

  // The JS check is only a length check: it does not require the leading 0 or 3
  // that the input's HTML `pattern` attribute insists on, so a browser rejects
  // this number before these functions ever see it.
  it('accepts nine digits that do not look like an Italian number', () => {
    expect(validatePhone('123456789')).toBe(true);
  });
});

describe('validateVATNumber', () => {
  it('accepts a partita IVA whose check digit is right', () => {
    expect(validateVATNumber('03194570648')).toBe(true);
  });

  it('rejects one whose check digit is wrong', () => {
    expect(validateVATNumber('03194570647')).toBe(false);
    expect(validateVATNumber('12345678901')).toBe(false);
  });

  it('requires exactly eleven digits and nothing else', () => {
    expect(validateVATNumber('0319457064')).toBe(false);
    expect(validateVATNumber('031945706488')).toBe(false);
    expect(validateVATNumber('IT03194570648')).toBe(false);
    expect(validateVATNumber('0319457064a')).toBe(false);
  });

  // The checksum is arithmetic, not a lookup: all-zeros satisfies it.
  it('accepts all zeros, which is not a real VAT number', () => {
    expect(validateVATNumber('00000000000')).toBe(true);
  });
});

describe('validateContactForm', () => {
  const form = (entries: Record<string, string>) => {
    const data = new FormData();
    Object.entries(entries).forEach(([key, value]) => data.append(key, value));
    return data;
  };

  it('reports no errors for a well-formed private enquiry', () => {
    const errors = validateContactForm(
      form({
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 377 357 5917',
        message: 'Vorrei un preventivo.',
      }),
      'private'
    );

    expect(errors).toEqual({});
  });

  it('returns the Italian message for each bad field', () => {
    const errors = validateContactForm(
      form({ email: 'mario@example', phone: '123' }),
      'private'
    );

    expect(errors).toEqual({
      email: 'Inserisci un indirizzo email valido',
      phone: 'Inserisci un numero di telefono italiano valido',
    });
  });

  // Empty and missing fields are the `required` attribute's job, so the form
  // is blocked by the browser long before it gets here.
  it('says nothing about a field that is missing or empty', () => {
    expect(validateContactForm(form({}), 'private')).toEqual({});
    expect(
      validateContactForm(form({ email: '', phone: '' }), 'private')
    ).toEqual({});
  });

  it('checks the VAT number only on the business tab', () => {
    const entries = {
      company_name: 'ACME S.r.l.',
      vat_number: '12345678901',
      email: 'ordini@example.com',
      phone: '081 123 4567',
    };

    expect(validateContactForm(form(entries), 'business')).toEqual({
      vat_number: 'Inserisci una Partita IVA italiana valida (11 cifre)',
    });
    expect(validateContactForm(form(entries), 'private')).toEqual({});
  });

  it('says nothing about a missing VAT number, business tab included', () => {
    expect(
      validateContactForm(form({ email: 'ordini@example.com' }), 'business')
    ).toEqual({});
    expect(validateContactForm(form({ vat_number: '' }), 'business')).toEqual(
      {}
    );
  });
});
