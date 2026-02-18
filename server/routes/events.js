import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../db.js';

const router = Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const col = await getCollection('events');
    const events = await col.find({}).sort({ createdAt: -1 }).toArray();
    // Map _id to id for frontend compatibility
    res.json(events.map(e => ({ ...e, id: e._id.toString(), _id: undefined })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event
router.post('/', async (req, res) => {
  try {
    const col = await getCollection('events');
    const event = { ...req.body, createdAt: new Date().toISOString() };
    const result = await col.insertOne(event);
    res.status(201).json({ ...event, id: result.insertedId.toString(), _id: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const col = await getCollection('events');
    const { id } = req.params;
    const update = { ...req.body };
    delete update._id;
    delete update.id;
    await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await col.findOne({ _id: new ObjectId(id) });
    res.json({ ...updated, id: updated._id.toString(), _id: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const col = await getCollection('events');
    const { id } = req.params;
    await col.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
