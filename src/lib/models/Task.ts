import { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  name: { type: String, required: true },
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;