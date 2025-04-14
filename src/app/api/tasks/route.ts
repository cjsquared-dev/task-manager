import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Task from '../../../lib/models/Task';

// POST: Save a new task
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    await dbConnect();

    const newTask = new Task({ name });
    await newTask.save();

    return NextResponse.json({ message: 'Task saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving task:', error);
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 });
  }
}

// GET: Fetch all tasks
export async function GET() {
  try {
    await dbConnect();

    const tasks = await Task.find({});

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// DELETE: Delete a task by name
// DELETE: Delete a task by name
export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const name = url.searchParams.get('name'); // Extract 'name' from query parameters

    if (!name) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    const result = await Task.deleteOne({ name });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

// PATCH: Update task volunteers
export async function PATCH(req: Request) {
  try {
    const { taskName, hourIndex, volunteer, action } = await req.json();
    console.log('PATCH request payload:', { taskName, hourIndex, volunteer, action }); // Log the payload

    if (!taskName || hourIndex === undefined || !volunteer || !action) {
      console.error('Invalid payload:', { taskName, hourIndex, volunteer, action });
      return NextResponse.json({ error: 'Task name, hour index, volunteer, and action are required' }, { status: 400 });
    }

    await dbConnect();

    const task = await Task.findOne({ name: taskName }); // Find task by name
    if (!task) {
      console.error('Task not found:', taskName);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!task.volunteers) {
      task.volunteers = {};
    }

    const hourKey = `hour-${hourIndex}`;
    console.log('Hour key:', hourKey); // Log the hour key
    console.log('Current volunteers:', task.volunteers[hourKey]); // Log current volunteers for the hour
    console.log('Action:', action); // Log the action
    console.log('Volunteer:', volunteer); // Log the volunteer
    console.log('volunteer name:', volunteer.name); // Log the volunteer name


    if (action === 'add') {
      // Add the volunteer to the specified hour
      if (!task.volunteers[hourKey]) {
        task.volunteers[hourKey] = [];
      }
      task.volunteers[hourKey].push(volunteer);
    } else if (action === 'remove') {
      // Remove the volunteer from the specified hour
      if (task.volunteers[hourKey]) {
        task.volunteers[hourKey] = task.volunteers[hourKey].filter((v: { name: string }) => v.name !== volunteer.name);
        if (task.volunteers[hourKey].length === 0) {
          delete task.volunteers[hourKey]; // Remove the hour key if no volunteers are left
        }
      }
    }

    await task.save();
    console.log('Updated task:', task);

    console.log('Volunteer assignment updated successfully:', { taskName, hourIndex, volunteer, action });
    return NextResponse.json({ message: 'Volunteer assignment updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating volunteer assignment:', error);
    return NextResponse.json({ error: 'Failed to update volunteer assignment' }, { status: 500 });
  }
}