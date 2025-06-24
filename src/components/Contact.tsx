/* eslint-disable */
import React, {FormEventHandler} from 'react';

const Contact = () => {
  // @ts-ignore
    const [result, setResult] = React.useState('');

  // @ts-ignore
  const onSubmit : FormEventHandler = async (event: Event) => {
    event.preventDefault();
    setResult('Sending....');
    const formData = new FormData(event.target as HTMLFormElement);

    formData.append('access_key', '70a69a85-3c89-4cbb-a177-3b06448be0b8');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult('Form Submitted Successfully');
      // @ts-ignore
        event?.target?.reset();
    } else {
      console.log('Error', data);
      setResult(data.message);
    }
  };

    return  (<div className="flex justify-center items-center p-8 bg-gray-100 dark:bg-gray-900">
      <div className="bg-background dark:bg-gray-800 p-10 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Contact Us</h2>
        <p className="mb-8 text-tertiary dark:text-gray-400">If you have any questions, feel free to reach out!</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="text-left">
            <label htmlFor="name" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Name:</label>
            <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div className="text-left">
            <label htmlFor="email" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Email:</label>
            <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div className="text-left">
            <label htmlFor="message" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Message:</label>
            <textarea
                id="message"
                name="message"
                required
                className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y min-h-[140px]"
            ></textarea>
          </div>

          <button
              type="submit"
              className="py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg text-lg cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Send
          </button>
        </form>
        {result && <span className="mt-6 block font-semibold text-gray-800 dark:text-gray-200">{result}</span>}
      </div>
    </div>
);
};

export default Contact;
