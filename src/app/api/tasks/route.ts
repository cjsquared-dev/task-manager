import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { Task } from '../../../lib/models/Task.model';
import { Volunteer } from '../../../lib/models/Volunteer.model';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitize from 'mongo-sanitize';


const taskSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
});

// POST: Save a new task
export async function POST(req: Request) {
  try {
    const { name } = sanitize(await req.json());// Sanitize the input to prevent NoSQL injection
    const {error} = await taskSchema.validate({ name });
    if (error) {
      console.error('Validation error:', error);
      return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }
    console.log('POST request payload:', { name }); // Log the payload

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
    const tasks = await Task.find({}).limit(20).skip(0).lean(); // Use `.lean()` to get plain JavaScript objects

    // Populate volunteer data for each task
    for (const task of tasks) {
      for (const hourSlot of task.hourIndex) {
        // Resolve volunteer ObjectIds to their corresponding documents
        const populatedVolunteers = await Volunteer.find({
          _id: { $in: hourSlot.volunteers },
        }).select('name color').limit(20).skip(0); // Fetch only the name and color fields

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
    const taskId = sanitize(url.searchParams.get('id')); // Extract 'id' from query parameters

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

// PATCH: Update task volunteers or add/remove hours
export async function PATCH(req: Request) {
  try {
    const { taskId, name, hourIndex, volunteer, action } = sanitize(await req.json()); // Sanitize the input to prevent NoSQL injection
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

    const task = await Task.findById(taskId); // Find task by ID
    if (!task) {
      console.error('Task not found:', taskId);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (action === 'removeHour') {
      // Remove the hour index from the hourIndex array
      task.hourIndex = task.hourIndex.filter((slot: { index: number }) => slot.index !== hourIndex);
      await task.save();
      console.log(`Hour ${hourIndex} removed from task ${taskId}`);
      return NextResponse.json({ message: 'Hour removed successfully', task }, { status: 200 });
    } else if (action === 'addHour') {
      const existingHour = task.hourIndex.find((slot: { index: number }) => slot.index === hourIndex);
      if (!existingHour) {
        task.hourIndex.push({ index: hourIndex, volunteers: [] });
        await task.save();
        console.log(`Hour ${hourIndex} added to task ${taskId}`);
        return NextResponse.json({ message: 'Hour added successfully', task }, { status: 200 });
      }
    } else if (action === 'add' || action === 'remove') {
      const hourSlot = task.hourIndex.find((slot: { index: number; volunteers: string[] }) => slot.index === hourIndex);
      if (!hourSlot) {
        console.error('Hour slot not found:', hourIndex);
        return NextResponse.json({ error: 'Hour slot not found' }, { status: 404 });
      }

      if (action === 'add') {
        // Validate and convert volunteer._id to ObjectId
        if (!mongoose.Types.ObjectId.isValid(volunteer._id)) {
          console.error('Invalid volunteer ID:', volunteer._id);
          return NextResponse.json({ error: 'Invalid volunteer ID' }, { status: 400 });
        }

        const volunteerId = new mongoose.Types.ObjectId(volunteer._id);

        // Add the volunteer to the hour slot
        const existingVolunteer = hourSlot.volunteers.find(
          (v: string) => v.toString() === volunteerId.toString()
        );

        if (!existingVolunteer) {
          hourSlot.volunteers.push(volunteerId); // Add the volunteer's ObjectId
        }
      } else if (action === 'remove') {
        // Find the volunteer's ObjectId by their name
        const volunteerDoc = await Volunteer.findOne({ name: volunteer.name }).select('_id');
        if (!volunteerDoc) {
          console.error('Volunteer not found:', volunteer.name);
          return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
        }

        const volunteerId = volunteerDoc._id;

        // Remove the volunteer's ObjectId from the hour slot
        const initialLength = hourSlot.volunteers.length;
        hourSlot.volunteers = hourSlot.volunteers.filter(
          (v: string) => v.toString() !== volunteerId.toString()
        );

        if (hourSlot.volunteers.length === initialLength) {
          console.error('Volunteer not found in hour slot:', volunteerId);
          return NextResponse.json({ error: 'Volunteer not found in hour slot' }, { status: 404 });
        }
      }

      await task.save();
      console.log('Updated task:', task);
      return NextResponse.json({ message: 'Volunteer assignment updated successfully', task }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}