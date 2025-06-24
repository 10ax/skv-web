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

    return (
    <div className="contact">
      <h2>Contact Us</h2>
      <p>If you have any questions, feel free to reach out!</p>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" required></textarea>

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Contact;
