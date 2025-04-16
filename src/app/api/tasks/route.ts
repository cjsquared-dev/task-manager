import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { Task } from '../../../lib/models/Task.model';
import { Volunteer } from '../../../lib/models/Volunteer.model';

// POST: Save a new task
export async function POST(req: Request) {
  try {
    const { name, volunteers } = await req.json();
    console.log('POST request payload:', { name, volunteers }); // Log the payload

    if (!name) {
      console.error('Task name is required');
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    await dbConnect();

    // If volunteers are provided, validate their ObjectIds
    let volunteerIds = [];
    if (volunteers && volunteers.length > 0) {
      const validVolunteers = await Volunteer.find({ _id: { $in: volunteers } });
      volunteerIds = validVolunteers.map((volunteer) => volunteer._id);
    }

    // Create a new task
    const newTask = new Task({
      name,
      volunteers: volunteerIds, // Add validated volunteer ObjectIds
    });

    await newTask.save();

    console.log('Task saved successfully:', newTask);
    return NextResponse.json({ message: 'Task saved successfully', task: newTask }, { status: 201 });
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

// DELETE: Delete a task by ObjectId
export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const taskId = url.searchParams.get('id'); // Extract 'id' from query parameters

    console.log('DELETE request task ID:', taskId); // Log the task ID
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const result = await Task.deleteOne({ _id: taskId }); // Delete task by ObjectId
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

// PATCH: Update task name or volunteers
export async function PATCH(req: Request) {
  try {
    const { taskId, name, hourIndex, volunteer, action } = await req.json();
    console.log('PATCH request payload:', { taskId, name, hourIndex, volunteer, action }); // Log the payload

    await dbConnect();

    if (name && taskId) {
      // Update task name
      const updatedTask = await Task.findByIdAndUpdate(taskId, { name }, { new: true });
      if (!updatedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      console.log('Task name updated successfully:', updatedTask);
      return NextResponse.json({ message: 'Task name updated successfully', task: updatedTask }, { status: 200 });
    }

    if (!taskId || hourIndex === undefined || !volunteer || !action) {
      console.error('Invalid payload:', { taskId, hourIndex, volunteer, action });
      return NextResponse.json({ error: 'Task ID, hour index, volunteer, and action are required' }, { status: 400 });
    }

    const task = await Task.findById(taskId); // Find task by ID
    if (!task) {
      console.error('Task not found:', taskId);
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

    return NextResponse.json({ message: 'Volunteer assignment updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}