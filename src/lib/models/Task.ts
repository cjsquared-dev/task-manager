import { Schema, model, models } from 'mongoose';

const VolunteerSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});

const TaskSchema = new Schema({
  name: { type: String, required: true },
  volunteers: { type: Map, of: [VolunteerSchema], default: {} }, // Map of hourIndex to volunteers
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;