import { model, models, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IVolunteer } from '../types/interfaces/volunteer.interface';

const VolunteerSchema = new Schema<IVolunteer>(

  {
    _id: {
      type: String,
      default: uuidv4,
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