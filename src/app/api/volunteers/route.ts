import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { Volunteer } from '../../../lib/models/Volunteer.model';
import sanitize from 'mongo-sanitize';

// This function handles POST requests to save a new volunteer
export async function POST(req: Request) {
  try {
    const { name, color } = sanitize(await req.json()); // Sanitize the input to prevent NoSQL injection
    console.log('POST request payload:', { name, color }); // Log the payload

    if (!name || !color) {
      console.error('Invalid payload:', { name, color });
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });
    }

    await dbConnect();

    const newVolunteer = new Volunteer({ name, color });
    await newVolunteer.save();

    console.log('Volunteer saved successfully:', newVolunteer);
    return NextResponse.json({ message: 'Volunteer saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return NextResponse.json({ error: 'Failed to save volunteer' }, { status: 500 });
  }
}

// this function handles GET requests to fetch all volunteers
export async function GET() {
  try {
    await dbConnect();

    // Fetch all volunteers and include only the name and color fields
    const volunteers = await Volunteer.find({}).select('name color').limit(20).skip(0);

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

// DELETE: Remove a volunteer by name
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const name = sanitize(url.searchParams.get('name')); // Extract 'name' from query parameters

    if (!name) {
      return NextResponse.json({ error: 'Volunteer name is required' }, { status: 400 });
    }

    await dbConnect();

    const result = await Volunteer.deleteOne({ name });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Volunteer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return NextResponse.json({ error: 'Failed to delete volunteer' }, { status: 500 });
  }
}