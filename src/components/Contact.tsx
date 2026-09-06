import React from 'react';

type CustomerType = 'private' | 'business';

interface ValidationErrors {
  [key: string]: string;
}

const Contact = () => {
  const [result, setResult] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<CustomerType>('private');
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Italian phone number validation (mobile and landline)
    // Simplified: optional +39, then 9-11 digits
    const normalizedPhone = phone.replaceAll(/[\s-]/g, '');
    const phoneRegex = /^(\+39)?\d{9,11}$/;
    return phoneRegex.test(normalizedPhone);
  };

  const validateVATNumber = (vat: string): boolean => {
    // Italian VAT number validation (11 digits)
    const vatRegex = /^\d{11}$/;
    if (!vatRegex.test(vat)) return false;

    // Additional checksum validation for Italian VAT
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

  const validateForm = (formData: FormData): ValidationErrors => {
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult('');
    setErrors({});

    const form = event.currentTarget;

    const submitForm = async (): Promise<void> => {
      const formData = new FormData(form);

      // Validate form
      const formErrors = validateForm(formData);
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      setResult('Sending....');

      formData.append('access_key', '1ead75c5-515f-4f38-bed9-0cbcf9502d88');
      formData.append('customer_type', activeTab);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const data: { success?: boolean; message?: string } =
          await response.json();

        if (data.success) {
          setResult('Form Submitted Successfully');
          form.reset();
          setErrors({});
        } else {
          setResult(data.message ?? 'Unexpected error');
        }
      } catch {
        setResult('Network error, please try again.');
      }
    };

    submitForm().catch(() => {
      setResult('Network error, please try again.');
    });
  };

  const renderContactFields = () => (
    <>
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
        ></textarea>
      </div>
    </>
  );

  const renderPrivateForm = () => (
    <>
      <div className="text-left">
        <label
          htmlFor="name"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Nome:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="surname"
          className="block mb-2 font-semibold text-gray-700 dark:text-gray-300"
        >
          Cognome:
        </label>
        <input
          type="text"
          id="surname"
          name="surname"
          required
          minLength={2}
          className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {renderContactFields()}
    </>
  );

  const renderBusinessForm = () => (
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

      {renderContactFields()}
    </>
  );

  return (
    <div
      className="flex justify-center items-center p-8 bg-gray-100 dark:bg-gray-900"
      id="contact"
    >
      <div className="bg-background dark:bg-gray-800 p-10 rounded-xl shadow-lg max-w-2xl w-full text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight mb-4 text-border dark:text-white">
          Contattaci
        </h2>
        <p className="mb-8 text-tertiary dark:text-gray-400">
          Scegli il tipo di cliente e compila il modulo per essere contattato!
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('private');
                setErrors({});
                setResult('');
              }}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'private'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Cliente Privato
            </button>
            <button
              onClick={() => {
                setActiveTab('business');
                setErrors({});
                setResult('');
              }}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'business'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Azienda
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {activeTab === 'private' ? renderPrivateForm() : renderBusinessForm()}

          <button
            type="submit"
            className="py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg text-lg cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Invia
          </button>
        </form>
        {result && (
          <span className="mt-6 block font-semibold text-gray-800 dark:text-gray-200">
            {result}
          </span>
        )}
      </div>
    </div>
  );
};

export default Contact;
