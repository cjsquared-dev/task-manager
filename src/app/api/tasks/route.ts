import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Task from '@/lib/models/Task';

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

  //