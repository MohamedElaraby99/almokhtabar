import { Schema, model } from "mongoose";

const unitAccessSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    unitId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    accessStartAt: {
        type: Date,
        default: Date.now
    },
    accessEndAt: {
        type: Date,
        required: true
    },
    source: {
        type: String,
        enum: ['code'],
        default: 'code'
    },
    codeId: {
        type: Schema.Types.ObjectId,
        ref: 'UnitAccessCode'
    }
}, { timestamps: true });

// Prevent overlapping duplicates for same user/course/unit if still active
unitAccessSchema.index({ userId: 1, courseId: 1, unitId: 1, accessEndAt: -1 });

export default model('UnitAccess', unitAccessSchema);
