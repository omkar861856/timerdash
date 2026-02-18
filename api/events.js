import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'timerdash';

let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient.db(dbName);
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  return cachedClient.db(dbName);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = await connectDB();
  const col = db.collection('events');

  if (req.method === 'GET') {
    const events = await col.find({}).sort({ createdAt: -1 }).toArray();
    return res.json(events.map(e => ({ ...e, id: e._id.toString(), _id: undefined })));
  }

  if (req.method === 'POST') {
    const event = { ...req.body, createdAt: new Date().toISOString() };
    const result = await col.insertOne(event);
    return res.status(201).json({ ...event, id: result.insertedId.toString(), _id: undefined });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
