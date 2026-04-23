const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// POST /api/items - Add item (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { itemName, description, type, location, contactInfo } = req.body;
    if (!itemName || !type || !location || !contactInfo) {
      return res.status(400).json({ msg: 'Please fill in all required fields' });
    }
    const item = new Item({ itemName, description, type, location, contactInfo, postedBy: req.user });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('POST /api/items error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/items/search?name=xyz - Search (must be BEFORE /:id route)
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    // ✅ Fix: guard against empty/missing name param
    if (!name || !name.trim()) {
      const items = await Item.find().sort({ date: -1 });
      return res.json(items);
    }
    const items = await Item.find({
      itemName: { $regex: name.trim(), $options: 'i' }
    }).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    console.error('GET /api/items/search error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/items - View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    console.error('GET /api/items error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/items/:id - View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error('GET /api/items/:id error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/items/:id - Update item (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/items/:id error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/items/:id - Delete item (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/items/:id error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
