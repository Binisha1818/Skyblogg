import { useState } from "react";
import axios from "axios";
import "./forgotPassword.css";

const API_URL = "https://sky-dlae.onrender.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">
          Send Reset Link
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
