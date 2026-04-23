import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await axios.post(`${API}/api/register`, form);
      setMsg('Registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '80px auto' }}>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: 12 }}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
