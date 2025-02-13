import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { pageId, linkIndex, userId } = req.body;

    const result = await db.collection('static_links').updateOne(
      { _id: ObjectId(pageId) },
      { 
        $set: {
          [`links.${linkIndex}.is_updated`]: true,
          [`links.${linkIndex}.updated_at`]: new Date(),
          [`links.${linkIndex}.updated_by`]: userId,
          updated_at: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Link not found' });
    }

    return res.status(200).json({ message: 'Link updated successfully' });
  } catch (error) {
    console.error('Error updating link:', error);
    return res.status(500).json({ message: 'Error updating link' });
  }
} 