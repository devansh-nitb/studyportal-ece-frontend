import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; 
import './FeedbackForm.scss'; 

const FeedbackForm = () => {
  const { user, API_URL } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    message: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [loading, setLoading] = useState(false);

  const { name, email, message: feedbackMessage } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!feedbackMessage) {
      setMessage('Please enter your feedback message.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!user && (!name || !email)) {
      setMessage('Please provide your name and email for anonymous feedback.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(user && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        }
      };

      const payload = user ? { message: feedbackMessage } : { name, email, message: feedbackMessage };

      const res = await axios.post(`${API_URL}/feedback`, payload, config);

      if (res.data.success) {
        setMessage(res.data.message);
        setMessageType('success');
        setFormData({ ...formData, message: '' });
      } else {
        setMessage(res.data.message || 'Failed to submit feedback.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Feedback submission error:', err.response?.data?.message || err.message);
      setMessage(err.response?.data?.message || 'Feedback submission failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Share Your Feedback</h3>
      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <form onSubmit={onSubmit}>
        {!user && ( 
          <>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required={!user}
                aria-label="Your Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required={!user}
                aria-label="Your Email"
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label htmlFor="feedbackMessage">Message</label>
          <textarea
            id="feedbackMessage"
            name="message"
            value={feedbackMessage}
            onChange={onChange}
            required
            rows="5"
            placeholder="Type your feedback here..."
            aria-label="Feedback Message"
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
