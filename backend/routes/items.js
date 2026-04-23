const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// POST /api/items - Add item (protected)
router.post('/', auth, async (req, res) => {
  try {
    const item = new Item({ ...req.body, postedBy: req.user });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/items/search?name=xyz - Search (must be before /:id)
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    const items = await Item.find({
      itemName: { $regex: name, $options: 'i' }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/items - View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
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
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/items/:id - Update item (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/items/:id - Delete item (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
