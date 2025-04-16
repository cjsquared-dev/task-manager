import { Schema, model, models } from 'mongoose';
import { ITask } from '../types/interfaces/task.interface';

const TaskSchema = new Schema<ITask>(
  {
    name: { 
      type: String,
      required: true,
    },
    hourIndex: [
      {
        index: { type: Number, required: true }, // Corresponds to the table's hour index
        volunteers: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Volunteer', // Reference to the Volunteer model
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const Task = models.Task || model<ITask>('Task', TaskSchema);