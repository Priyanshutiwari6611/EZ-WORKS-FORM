import { useState } from "react";

const API_URL = "https://vernanbackend.ezlab.in/api/contact-us/";

const initial = { name: "", email: "", phone: "", message: "" };

export default function App() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    // live-clear field error
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  // simple validators
  const validate = () => {
    const er = {};
    if (!values.name.trim()) er.name = "Name is required";
    if (!values.email.trim()) er.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
      er.email = "Enter a valid email";
    if (!values.phone.trim()) er.phone = "Phone is required";
    else if (!/^\d{7,15}$/.test(values.phone.replace(/\s|-/g, "")))
      er.phone = "Use digits only (7–15)";
    if (!values.message.trim()) er.message = "Message is required";
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const er = validate();
    if (Object.keys(er).length) {
      setErrors(er);
      return; // block empty/invalid submission (frontend validation)
    }

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setStatus({ type: "success", msg: "Form Submitted" });
        setValues(initial);
      } else {
        // try to read error
        let detail = "";
        try { detail = (await res.json())?.detail || ""; } catch {}
        setStatus({
          type: "error",
          msg: `Submit failed (${res.status}). ${detail}`,
        });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Contact Us</h1>
        <p className="subtitle">Please fill the form below.</p>

        <form onSubmit={onSubmit} noValidate className="form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name" name="name" value={values.name} onChange={onChange}
              placeholder="Amit Kumar"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email" name="email" type="email"
              value={values.email} onChange={onChange}
              placeholder="name@example.com" required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone" name="phone" value={values.phone} onChange={onChange}
              placeholder="9876543210"
              inputMode="numeric"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message" name="message" rows="4"
              value={values.message} onChange={onChange}
              placeholder="Write your message..."
            />
            {errors.message && <span className="error">{errors.message}</span>}
          </div>

          <button className="btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>

          {status.msg && (
            <div
              className={`status ${status.type === "success" ? "ok" : "bad"}`}
              role="status"
              aria-live="polite"
            >
              {status.msg}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}