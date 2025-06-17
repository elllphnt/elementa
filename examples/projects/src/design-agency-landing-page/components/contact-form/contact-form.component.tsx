import React from "react";
import useContactForm from "~/hooks/useContactForm.hook.js";

const ContactForm: React.FC = () => {
  const {
    formData,
    isSubmitting,
    isSubmitted,
    error,
    handleChange,
    handleSubmit,
  } = useContactForm();

  if (isSubmitted) {
    return (
      <div id="root">
        <div id="success-message">
          <div id="success-icon">✓</div>
          <h3 id="success-title">Message Sent!</h3>
          <p id="success-text">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="root">
      <form id="contact-form" onSubmit={handleSubmit}>
        <h2 id="form-title">Send us a message</h2>

        {error && <div id="error-message">{error}</div>}

        <div id="form-row">
          <div id="form-group">
            <label id="form-label" htmlFor="name">
              Name *
            </label>
            <input
              id="form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div id="form-group">
            <label id="form-label" htmlFor="email">
              Email *
            </label>
            <input
              id="form-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div id="form-group">
          <label id="form-label" htmlFor="company">
            Company
          </label>
          <input
            id="form-input"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your company"
          />
        </div>

        <div id="form-group">
          <label id="form-label" htmlFor="service">
            Service Interested In
          </label>
          <select
            id="form-select"
            name="service"
            value={formData.service}
            onChange={handleChange}
          >
            <option value="">Select a service</option>
            <option value="branding">Brand Identity Design</option>
            <option value="web-design">Web Design & Development</option>
            <option value="strategy">Digital Strategy</option>
            <option value="ecommerce">E-commerce Solutions</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div id="form-group">
          <label id="form-label" htmlFor="budget">
            Budget Range
          </label>
          <select
            id="form-select"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          >
            <option value="">Select budget range</option>
            <option value="under-5k">Under $5,000</option>
            <option value="5k-10k">$5,000 - $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="over-50k">Over $50,000</option>
          </select>
        </div>

        <div id="form-group">
          <label id="form-label" htmlFor="message">
            Message *
          </label>
          <textarea
            id="form-textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Tell us about your project..."
            rows={5}
          />
        </div>

        <button id="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
