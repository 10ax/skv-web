/* eslint-disable */
import React, { FormEventHandler } from 'react';

import BusinessForm from './BusinessForm';
import PrivateForm from './PrivateForm';
import { CustomerType, ValidationErrors } from './types';
import { validateForm } from './validation';

const Contact = () => {
  const [result, setResult] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<CustomerType>('private');
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setResult('');
    setErrors({});

    const formData = new FormData(event.target as HTMLFormElement);

    // Validate form
    const formErrors = validateForm(formData, activeTab);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setResult('Sending....');

    formData.append('access_key', '70a69a85-3c89-4cbb-a177-3b06448be0b8');
    formData.append('customer_type', activeTab);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult('Form Submitted Successfully');
      // @ts-ignore
      event?.target?.reset();
      setErrors({});
    } else {
      console.log('Error', data);
      setResult(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center p-8 bg-gray-100 dark:bg-gray-900">
      <div className="bg-background dark:bg-gray-800 p-10 rounded-xl shadow-lg max-w-2xl w-full text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
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
          {activeTab === 'private' ? (
            <PrivateForm errors={errors} />
          ) : (
            <BusinessForm errors={errors} />
          )}

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
