import { Document, ObjectId } from "mongoose";
import { IVolunteer } from "./volunteer.interface";

export interface ITask extends Document {
  _id: ObjectId;
  name: string;
  hourIndex: {
    index: number; // Corresponds to the table's hour index
    volunteers: IVolunteer[]; // Array of volunteers assigned to this hour
  }[];
}