import { model, models, Schema } from 'mongoose';

const VolunteerSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});

const Volunteer = models.Volunteer || model('Volunteer', VolunteerSchema);

export default Volunteer;