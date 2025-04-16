import { model, models, Schema } from 'mongoose';
import { IVolunteer } from '../types/interfaces/volunteer.interface';
import mongoose from 'mongoose';

const VolunteerSchema = new Schema<IVolunteer>(

  {
    _id: { type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId() 
    },
    name: { 
      type: String, 
      required: true 
    },
    color: { 
      type: String, 
      required: true 
    },
    hourIndex: {
      type: Number,
      required: false,
    }, // The index of the hour in the task
  },
  {
    timestamps: true,
  }
);

export const Volunteer = models.Volunteer || model<IVolunteer>('Volunteer', VolunteerSchema);