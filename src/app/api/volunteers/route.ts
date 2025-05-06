// This function handles POST requests to save a new volunteer
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { Volunteer } from '../../../lib/models/Volunteer.model';
import sanitize from 'mongo-sanitize';
import Joi from 'joi'; // Validation library

// Define a schema for validation
const volunteerSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(), // Name must be 1-50 characters
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(), // Color must be a valid hex code
});

// This function handles POST requests to save a new volunteer
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sanitizedBody = {
      name: sanitize(body.name),
      color: sanitize(body.color),
    };

    // Validate the sanitized input
    const { error } = volunteerSchema.validate(sanitizedBody);
    if (error) {
      console.error('Validation error:', error.details);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await dbConnect();

    const newVolunteer = new Volunteer(sanitizedBody);
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

    // No sanitization needed here as we're only fetching data
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
    const name = sanitize(url.searchParams.get('name')); // Sanitize the query parameter

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