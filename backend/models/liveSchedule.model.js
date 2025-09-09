import { Schema, model } from 'mongoose';

const slotSchema = new Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true }, // HH:mm
  duration: { type: Number, enum: [60, 90, 120], required: true },
  startDate: { type: Date, default: Date.now }
}, { _id: false });

const liveScheduleSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  timezone: { type: String, default: 'Africa/Cairo' },
  slots: { type: [slotSchema], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String }
}, { timestamps: true });

export default model('LiveSchedule', liveScheduleSchema);


