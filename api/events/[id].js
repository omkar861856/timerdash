import { MongoClient, ObjectId } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const db = await connectDB();
  const col = db.collection('events');

  if (req.method === 'PUT') {
    const update = { ...req.body };
    delete update._id;
    delete update.id;
    await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await col.findOne({ _id: new ObjectId(id) });
    return res.json({ ...updated, id: updated._id.toString(), _id: undefined });
  }

  if (req.method === 'DELETE') {
    await col.deleteOne({ _id: new ObjectId(id) });
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
