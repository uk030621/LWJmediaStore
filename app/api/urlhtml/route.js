import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function GET(_req) {
  const client = await clientPromise;
  const db = client.db();
  const urls = await db.collection('htmlurls').find({}).toArray();
  return new Response(JSON.stringify({ urls }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  const { url, title } = await req.json();
  if (!url || !title) {
    return new Response('URL and title are required', { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const newUrl = { url, title };
  await db.collection('htmlurls').insertOne(newUrl);

  return new Response(JSON.stringify({ message: 'URL added successfully' }), { status: 201 });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) {
    return new Response('ID is required', { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  try {
    await db.collection('htmlurls').deleteOne({ _id: new ObjectId(id) }); // Convert the ID to ObjectId
    return new Response(JSON.stringify({ message: 'URL deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete URL' }), { status: 500 });
  }
}
