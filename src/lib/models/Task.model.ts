import { Schema, model, models } from 'mongoose';
import { ITask } from '../types/interfaces/task.interface';




const TaskSchema = new Schema<ITask>(

  {
    name: { 
      type: String,
      required: true
    },
    volunteers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Volunteer',
      },
    ],
  },
  {
    timestamps: true,
  }
);
export const Task = models.Task || model<ITask>('Task', TaskSchema);