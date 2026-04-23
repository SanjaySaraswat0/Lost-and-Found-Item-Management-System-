import React, { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const name  = localStorage.getItem('name');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchItems = async () => {
    const res = await axios.get(`${API}/api/items`);
    setItems(res.data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/api/items/${editId}`, form, { headers });
        setMsg('Item updated!');
        setEditId(null);
      } else {
        await axios.post(`${API}/api/items`, form, { headers });
        setMsg('Item added!');
      }
      setForm(emptyForm);
      fetchItems();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await axios.delete(`${API}/api/items/${id}`, { headers });
    fetchItems();
  };

  const handleSearch = async () => {
    if (!search.trim()) { fetchItems(); return; }
    const res = await axios.get(`${API}/api/items/search?name=${search}`);
    setItems(res.data);
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
          <h2>{editId ? 'Edit Item' : 'Report Item'}</h2>
          {msg && <p className="success">{msg}</p>}
          <form onSubmit={handleSubmit}>
            <input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={2} style={{ width:'100%', padding:'10px', margin:'8px 0 16px', border:'1px solid #ccc', borderRadius:'4px' }} />
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Lost</option>
              <option>Found</option>
            </select>
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
            <input name="contactInfo" placeholder="Contact Info" value={form.contactInfo} onChange={handleChange} required />
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Submit'}</button>
            {editId && (
              <button type="button" className="btn-secondary" style={{ marginLeft: 8 }}
                onClick={() => { setEditId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Search */}
        <div className="card">
          <h2>All Items</h2>
          <div className="search-row">
            <input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn-secondary" onClick={() => { setSearch(''); fetchItems(); }}>Reset</button>
          </div>

          {items.length === 0 ? (
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
