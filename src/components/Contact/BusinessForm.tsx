import React from 'react';

import { FormProps } from './types';

const BusinessForm: React.FC<FormProps> = ({ errors }) => {
  return (
    <>
      <div className="text-left">
        <label
          htmlFor="company_name"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Ragione Sociale:
        </label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          required
          minLength={2}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="vat_number"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Partita IVA:
        </label>
        <input
          type="text"
          id="vat_number"
          name="vat_number"
          required
          pattern="[0-9]{11}"
          title="Inserisci una partita IVA italiana valida (11 cifre)"
          maxLength={11}
          className={`w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border ${
            errors.vat_number
              ? 'border-red-500'
              : 'border-border dark:border-gray-600'
          } rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
        />
        {errors.vat_number && (
          <p className="mt-1 text-sm text-red-500">{errors.vat_number}</p>
        )}
      </div>

      <div className="text-left">
        <label
          htmlFor="contact_person"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Persona di Contatto:
        </label>
        <input
          type="text"
          id="contact_person"
          name="contact_person"
          required
          minLength={2}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="email"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
          title="Inserisci un indirizzo email valido"
          className={`w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border ${
            errors.email
              ? 'border-red-500'
              : 'border-border dark:border-gray-600'
          } rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="text-left">
        <label
          htmlFor="phone"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Telefono:
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          pattern="(\+39\s?)?((3[0-9]{2}\s?\d{3}\s?\d{4})|(0[0-9]{1,3}\s?\d{3,4}\s?\d{3,4}))"
          title="Inserisci un numero di telefono italiano valido (es: +39 333 123 4567 o 02 1234567)"
          className={`w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border ${
            errors.phone
              ? 'border-red-500'
              : 'border-border dark:border-gray-600'
          } rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      <div className="text-left">
        <label
          htmlFor="address"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Indirizzo:
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          minLength={5}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="message"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Messaggio:
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={1000}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none min-h-[140px]"
        />
      </div>
    </>
  );
};

export default BusinessForm;
