import { Schema, model, models } from 'mongoose';

import { ITask } from '../types/interfaces/task.interface';
import { IVolunteer } from '../types/interfaces/volunteer.interface';

const VolunteerSchema = new Schema<IVolunteer>({
  name: { type: String, required: true },
  color: { type: String, required: true },
  hourIndex: { type: Number, required: true }, // The index of the hour in the task
});

const TaskSchema = new Schema<ITask>({
  name: { type: String, required: true },
  volunteers: { type: [VolunteerSchema], default: [] }, // Map of hourIndex to volunteers
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;