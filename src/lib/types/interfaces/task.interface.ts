import { Document, ObjectId } from "mongoose";
import { IVolunteer } from "./volunteer.interface";

export interface ITask extends Document {
    _id: ObjectId;
    name: string;
    volunteers: IVolunteer[];

}