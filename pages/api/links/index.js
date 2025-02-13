import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const links = await db.collection('static_links').find({}).toArray();
    return res.status(200).json(links || []);
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json({ message: 'Error fetching links' });
  }
} 