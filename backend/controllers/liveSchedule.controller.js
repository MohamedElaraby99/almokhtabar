import LiveSchedule from '../models/liveSchedule.model.js';
import AppError from '../utils/error.utils.js';

// User: get own schedule
const getMySchedule = async (req, res, next) => {
  try {
    const schedule = await LiveSchedule.findOne({ user: req.user.id });
    return res.status(200).json({ success: true, data: schedule });
  } catch (e) { return next(new AppError(e.message, 500)); }
};

// User: upsert own schedule (always resets status to pending)
const upsertMySchedule = async (req, res, next) => {
  try {
    const { timezone, slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return next(new AppError('يجب إضافة موعد واحد على الأقل', 400));
    }
    // Normalize and validate slots (accept numeric strings)
    const normalizedSlots = [];
    for (const s of slots) {
      const day = Number(s.dayOfWeek);
      const duration = Number(s.duration);
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        return next(new AppError('اليوم غير صحيح', 400));
      }
      if (!s.startTime || !/^\d{2}:\d{2}$/.test(s.startTime)) {
        return next(new AppError('الوقت غير صحيح (HH:mm)', 400));
      }
      if (![60, 90, 120].includes(duration)) {
        return next(new AppError('المدة يجب أن تكون 60 أو 90 أو 120 دقيقة', 400));
      }
      if (s.startDate && isNaN(Date.parse(s.startDate))) {
        return next(new AppError('تاريخ البدء غير صحيح', 400));
      }
      normalizedSlots.push({
        dayOfWeek: day,
        startTime: s.startTime,
        duration,
        ...(s.startDate ? { startDate: new Date(s.startDate) } : {})
      });
    }

    const schedule = await LiveSchedule.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, timezone, slots: normalizedSlots, status: 'pending', adminNote: '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: schedule });
  } catch (e) { return next(new AppError(e.message, 500)); }
};

// Admin: list schedules with pagination
const adminListSchedules = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await LiveSchedule.countDocuments(query);
    const items = await LiveSchedule.find(query)
      .populate('user', 'fullName email phoneNumber learningPath stage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    return res.status(200).json({ success: true, data: items, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (e) { return next(new AppError(e.message, 500)); }
};

// Admin: approve/reject
const adminSetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return next(new AppError('حالة غير صالحة', 400));
    }
    const schedule = await LiveSchedule.findByIdAndUpdate(id, { status, adminNote }, { new: true });
    if (!schedule) return next(new AppError('الجدول غير موجود', 404));
    return res.status(200).json({ success: true, data: schedule });
  } catch (e) { return next(new AppError(e.message, 500)); }
};

export { getMySchedule, upsertMySchedule, adminListSchedules, adminSetStatus };


