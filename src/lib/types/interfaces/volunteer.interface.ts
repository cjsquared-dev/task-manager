import { Document, ObjectId } from "mongoose";

export interface IVolunteer extends Document {
  _id: ObjectId;
  name: string;
  color: string;
  hourIndex: number; // The index of the hour in the task
}