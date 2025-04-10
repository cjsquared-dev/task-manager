import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Volunteer from '../../../lib/models/Volunteer';

// This function handles POST requests to save a new volunteer
export async function POST(req: Request) {
  try {
    const { name, color } = await req.json();

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });

    }

    await dbConnect();

    const newVolunteer = new Volunteer({ name, color });
    await newVolunteer.save();

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

    const volunteers = await Volunteer.find({});

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

