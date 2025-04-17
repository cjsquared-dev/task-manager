import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { Task } from '../../../lib/models/Task.model';
import { Volunteer } from '../../../lib/models/Volunteer.model';

// POST: Save a new task
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    console.log('POST request payload:', { name }); // Log the payload

    if (!name) {
      console.error('Task name is required');
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    await dbConnect();

    // Create a new task with 10 empty hourIndex slots
    const newTask = new Task({
      name,
      hourIndex: Array.from({ length: 10 }, (_, index) => ({
        index,
        volunteers: [],
      })),
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

    // Fetch all tasks
    const tasks = await Task.find({}).lean(); // Use `.lean()` to get plain JavaScript objects

    // Populate volunteer data for each task
    for (const task of tasks) {
      for (const hourSlot of task.hourIndex) {
        // Resolve volunteer ObjectIds to their corresponding documents
        const populatedVolunteers = await Volunteer.find({
          _id: { $in: hourSlot.volunteers },
        }).select('name color'); // Fetch only the name and color fields

        // Replace the ObjectIds with the populated volunteer data
        hourSlot.volunteers = populatedVolunteers;
      }
    }
    console.log('Populated tasks:', tasks);

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

// PATCH: Update task volunteers
export async function PATCH(req: Request) {
  try {
    const { taskId, name, hourIndex, volunteer, action } = await req.json();
    console.log('PATCH request payload:', { taskId, name, hourIndex, volunteer, action }); // Log the payload

    await dbConnect();

    const task = await Task.findById(taskId); // Find the task by ID
    if (!task) {
      console.error('Task not found:', taskId);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const hourSlot = task.hourIndex.find((slot: { index: unknown; }) => slot.index === hourIndex);
    if (!hourSlot) {
      console.error('Hour slot not found:', hourIndex);
      return NextResponse.json({ error: 'Hour slot not found' }, { status: 404 });
    }

    if (action === 'remove') {
      // Query the Volunteer collection to find the ObjectId by name
      const volunteerDoc = await Volunteer.findOne({ name: volunteer.name }).select('_id');
      if (!volunteerDoc) {
        console.error('Volunteer not found:', volunteer.name);
        return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
      }

      const volunteerId = volunteerDoc._id;

      // Remove the volunteer's ObjectId from the hour slot
      const initialLength = hourSlot.volunteers.length;
      hourSlot.volunteers = hourSlot.volunteers.filter(
        (v: { toString: () => unknown; }) => v.toString() !== volunteerId.toString()
      );

      if (hourSlot.volunteers.length === initialLength) {
        console.error('Volunteer not found in hour slot:', volunteerId);
        return NextResponse.json({ error: 'Volunteer not found in hour slot' }, { status: 404 });
      }
    }

    await task.save(); // Save the updated task to the database
    console.log('Updated task after removing volunteer:', task);

    return NextResponse.json({ message: 'Volunteer removed successfully', task }, { status: 200 });
  } catch (error) {
    console.error('Error updating volunteer assignment:', error);
    return NextResponse.json({ error: 'Failed to update volunteer assignment' }, { status: 500 });
  }
}