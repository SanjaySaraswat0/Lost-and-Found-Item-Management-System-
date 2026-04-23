import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const emptyForm = { itemName: '', description: '', type: 'Lost', location: '', contactInfo: '' };

function Dashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Fix: auto-clear messages after 3 seconds
  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };
  const showError = (text) => {
    setError(text);
    setTimeout(() => setError(''), 4000);
  };

  // ✅ Fix: error handling on fetchItems
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/items`);
      setItems(res.data);
    } catch (err) {
      showError('Failed to load items. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/api/items/${editId}`, form, { headers });
        showMsg('✅ Item updated successfully!');
        setEditId(null);
      } else {
        await axios.post(`${API}/api/items`, form, { headers });
        showMsg('✅ Item reported successfully!');
      }
      setForm(emptyForm);
      fetchItems();
    } catch (err) {
      showError(err.response?.data?.msg || '❌ Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      contactInfo: item.contactInfo
    });
    window.scrollTo(0, 0);
  };

  // ✅ Fix: error handling on handleDelete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API}/api/items/${id}`, { headers });
      showMsg('🗑️ Item deleted.');
      fetchItems();
    } catch (err) {
      showError(err.response?.data?.msg || '❌ Failed to delete item');
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) { fetchItems(); return; }
    try {
      // ✅ Fix: encodeURIComponent prevents broken URLs with special chars
      const res = await axios.get(`${API}/api/items/search?name=${encodeURIComponent(search)}`);
      setItems(res.data);
    } catch (err) {
      showError('Search failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <nav>
        <span>🔍 Lost & Found</span>
        <div>
          <span style={{ color: '#ccc', marginRight: 16 }}>👤 {name}</span>
          <button className="btn-danger" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container">

        {/* Add / Edit Form */}
        <div className="card">
          <h2>{editId ? '✏️ Edit Item' : '📋 Report Item'}</h2>
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input name="itemName" placeholder="Item Name *" value={form.itemName} onChange={handleChange} required />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
              rows={2}
              style={{ width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', fontSize: 14 }}
            />
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Lost</option>
              <option>Found</option>
            </select>
            <input name="location" placeholder="Location *" value={form.location} onChange={handleChange} required />
            <input name="contactInfo" placeholder="Contact Info *" value={form.contactInfo} onChange={handleChange} required />
            <button type="submit" className="btn-primary">{editId ? 'Update Item' : 'Submit Report'}</button>
            {editId && (
              <button type="button" className="btn-secondary" style={{ marginLeft: 8 }}
                onClick={() => { setEditId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Search + Table */}
        <div className="card">
          <h2>📦 All Items</h2>
          <div className="search-row">
            <input
              placeholder="Search by item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn-secondary" onClick={() => { setSearch(''); fetchItems(); }}>Reset</button>
          </div>

          {loading ? (
            <p>Loading items...</p>
          ) : items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item Name</th><th>Type</th><th>Location</th><th>Contact</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.itemName}</strong>
                      {item.description && <div style={{ fontSize: 12, color: '#777' }}>{item.description}</div>}
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>{item.contactInfo}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-primary" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
