import LiveMeeting from '../models/liveMeeting.model.js';
import User from '../models/user.model.js';
import Instructor from '../models/instructor.model.js';
import Stage from '../models/stage.model.js';
import Subject from '../models/subject.model.js';
import AppError from '../utils/error.utils.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new live meeting
// @route   POST /api/v1/live-meetings
// @access  Admin
export const createLiveMeeting = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    googleMeetLink,
    scheduledDate,
    duration,
    instructor, // optional now
    stage,
    subject,
    attendees,
    maxAttendees,
    isRecorded,
    tags
  } = req.body;

  // Validate required fields (stage/subject optional now)
  if (!title || !description || !googleMeetLink || !scheduledDate || !duration) {
    return next(new AppError('جميع الحقول المطلوبة يجب ملؤها', 400));
  }

  // Validate scheduled date is in the future
  const scheduledDateTime = new Date(scheduledDate);
  if (scheduledDateTime <= new Date()) {
    return next(new AppError('تاريخ الاجتماع يجب أن يكون في المستقبل', 400));
  }

  // Validate instructor exists (optional)
  let instructorId = undefined;
  if (instructor) {
    const instructorExists = await Instructor.findById(instructor);
    if (!instructorExists) {
      return next(new AppError('المحاضر غير موجود', 404));
    }
    instructorId = instructor;
  }

  // Validate stage exists (optional)
  let stageId = undefined;
  if (stage) {
    const stageExists = await Stage.findById(stage);
    if (!stageExists) {
      return next(new AppError('المرحلة غير موجودة', 404));
    }
    stageId = stage;
  }

  // Validate subject exists (optional)
  let subjectId = undefined;
  if (subject) {
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return next(new AppError('المادة غير موجودة', 404));
    }
    subjectId = subject;
  }

  // Validate attendees if provided
  let validatedAttendees = [];
  if (attendees && attendees.length > 0) {
    for (const attendeeId of attendees) {
      const attendeeUser = await User.findById(attendeeId);
      if (attendeeUser) {
        validatedAttendees.push({ user: attendeeId });
      }
    }
  }

  // Create live meeting
  const liveMeeting = await LiveMeeting.create({
    title,
    description,
    googleMeetLink,
    scheduledDate: scheduledDateTime,
    duration,
    ...(instructorId ? { instructor: instructorId } : {}),
    ...(stageId ? { stage: stageId } : {}),
    ...(subjectId ? { subject: subjectId } : {}),
    attendees: validatedAttendees,
    ...(maxAttendees ? { maxAttendees } : {}),
    isRecorded: isRecorded || false,
    tags: tags || [],
    createdBy: req.user._id || req.user.id
  });

  // Populate the created meeting
  await liveMeeting.populate([
    { path: 'instructor', select: 'name email' },
    { path: 'stage', select: 'name' },
    { path: 'subject', select: 'title' },
    { path: 'attendees.user', select: 'fullName email' },
    { path: 'createdBy', select: 'fullName email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الاجتماع المباشر بنجاح',
    liveMeeting
  });

  // Schedule reminder emails at T-30, T-20, T-10, and T0 minutes
  try {
    const sendReminder = async (minutesBefore) => {
      const when = new Date(scheduledDateTime.getTime() - minutesBefore * 60000);
      const delay = when.getTime() - Date.now();
      if (delay < 0) return; // too late to schedule
      setTimeout(async () => {
        try {
          const meeting = await LiveMeeting.findById(liveMeeting._id).populate('attendees.user', 'email fullName');
          if (!meeting) return;
          const subject = `تذكير بالجلسة المباشرة: ${meeting.title}`;
          const body = `لديك جلسة مباشرة بعد ${minutesBefore === 0 ? 'الآن' : minutesBefore + ' دقيقة'}\nرابط الجلسة: ${meeting.googleMeetLink}`;
          const emails = (meeting.attendees || [])
            .map(a => a.user?.email)
            .filter(Boolean);
          for (const email of emails) {
            await sendEmail(email, subject, body);
          }
        } catch (e) {
          console.error('Failed to send reminder:', e.message);
        }
      }, delay);
    };
    [30, 20, 10, 0].forEach(sendReminder);
  } catch (e) {
    console.error('Reminder scheduling error:', e.message);
  }
});

// @desc    Get all live meetings (Admin)
// @route   GET /api/v1/live-meetings/admin
// @access  Admin
export const getAllLiveMeetings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, stage, subject, instructor, startDate, endDate } = req.query;

  // Build filter object
  let filter = {};

  if (status) {
    filter.status = status;
  }

  if (stage) {
    filter.stage = stage;
  }

  if (subject) {
    filter.subject = subject;
  }

  if (instructor) {
    filter.instructor = instructor;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.scheduledDate = {};
    if (startDate) {
      filter.scheduledDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.scheduledDate.$lte = new Date(endDate);
    }
  }

  const totalMeetings = await LiveMeeting.countDocuments(filter);
  const totalPages = Math.ceil(totalMeetings / limit);

  const liveMeetings = await LiveMeeting.find(filter)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email')
    .sort({ scheduledDate: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'تم استرجاع الاجتماعات المباشرة بنجاح',
    liveMeetings,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMeetings,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get user's live meetings
// @route   GET /api/v1/live-meetings/my-meetings
// @access  User
export const getUserLiveMeetings = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const { status = 'scheduled', page = 1, limit = 10 } = req.query;

  // Build filter for user's meetings
  let filter = {
    'attendees.user': userId
  };

  if (status && status !== 'all') {
    filter.status = status;
  }

  // For upcoming meetings, also check date
  if (status === 'scheduled') {
    filter.scheduledDate = { $gte: new Date() };
  }

  const totalMeetings = await LiveMeeting.countDocuments(filter);
  const totalPages = Math.ceil(totalMeetings / limit);

  const liveMeetings = await LiveMeeting.find(filter)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .sort({ scheduledDate: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'تم استرجاع اجتماعاتك المباشرة بنجاح',
    liveMeetings,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMeetings,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get upcoming live meetings for user's stage
// @route   GET /api/v1/live-meetings/upcoming
// @access  User
export const getUpcomingLiveMeetings = asyncHandler(async (req, res, next) => {
  const userStage = req.user.stage;
  const userId = req.user._id || req.user.id;
  
  // Debug logging
  console.log('Debug - User requesting upcoming meetings:', {
    userId,
    userStage,
    userRole: req.user.role
  });

  // Build filter for upcoming meetings
  let filter = {
    status: 'scheduled',
    scheduledDate: { $gte: new Date() }
  };

  // If user has a stage, filter by stage, otherwise show all upcoming meetings
  if (userStage) {
    filter.stage = userStage;
  }

  const upcomingMeetings = await LiveMeeting.find(filter)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .sort({ scheduledDate: 1 })
    .limit(10);

  // Debug logging
  console.log('Debug - Found upcoming meetings:', {
    count: upcomingMeetings.length,
    meetings: upcomingMeetings.map(m => ({
      id: m._id,
      title: m.title,
      stage: m.stage?.name,
      stageId: m.stage?._id,
      scheduledDate: m.scheduledDate
    }))
  });

  // Add attendee information for each meeting
  const meetingsWithAttendeeInfo = upcomingMeetings.map(meeting => {
    const meetingObj = meeting.toObject();
    meetingObj.isUserAttendee = meeting.isUserAttendee(userId);
    meetingObj.attendeesCount = meeting.attendees.length;
    return meetingObj;
  });

  const message = userStage 
    ? 'تم استرجاع الاجتماعات القادمة بنجاح'
    : upcomingMeetings.length > 0 
      ? 'تم استرجاع جميع الاجتماعات القادمة - لم يتم تحديد مرحلتك الدراسية'
      : 'لا توجد اجتماعات قادمة';

  res.status(200).json({
    success: true,
    message,
    upcomingMeetings: meetingsWithAttendeeInfo,
    debug: {
      userHasStage: !!userStage,
      userStage: userStage,
      totalFound: upcomingMeetings.length
    }
  });
});

// @desc    Get single live meeting
// @route   GET /api/v1/live-meetings/:id
// @access  User/Admin
export const getLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;
  const userRole = req.user.role;

  const liveMeeting = await LiveMeeting.findById(id)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email');

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Check if user has access to this meeting
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    const isAttendee = liveMeeting.isUserAttendee(userId);
    const isInstructor = liveMeeting.instructor._id.toString() === userId.toString();
    
    // Debug logging for authorization
    console.log('🔐 Authorization check for meeting access:', {
      userId: userId,
      userRole: userRole,
      meetingId: id,
      isAttendee: isAttendee,
      isInstructor: isInstructor,
      instructorId: liveMeeting.instructor._id.toString(),
      attendees: liveMeeting.attendees.map(a => ({
        userId: a.user.toString(),
        matches: a.user.toString() === userId.toString()
      }))
    });
    
    if (!isAttendee && !isInstructor) {
      console.log('❌ Access denied - user is not attendee or instructor');
      return next(new AppError('غير مصرح لك بالوصول لهذا الاجتماع', 403));
    }
    
    console.log('✅ Access granted - user is authorized');
  }

  res.status(200).json({
    success: true,
    message: 'تم استرجاع الاجتماع المباشر بنجاح',
    liveMeeting
  });
});

// @desc    Update live meeting
// @route   PUT /api/v1/live-meetings/:id
// @access  Admin
export const updateLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Don't allow updating past meetings
  if (liveMeeting.status === 'completed') {
    return next(new AppError('لا يمكن تعديل اجتماع منتهي', 400));
  }

  // Validate scheduled date if provided
  if (updates.scheduledDate) {
    const scheduledDateTime = new Date(updates.scheduledDate);
    if (scheduledDateTime <= new Date()) {
      return next(new AppError('تاريخ الاجتماع يجب أن يكون في المستقبل', 400));
    }
  }

  // Transform attendees if provided - convert array of user IDs to proper schema format
  if (updates.attendees && Array.isArray(updates.attendees)) {
    console.log('🔄 Transforming attendees for update:', {
      originalAttendees: updates.attendees,
      existingAttendees: liveMeeting.attendees
    });
    
    // Keep existing attendees with their properties (hasJoined, joinedAt)
    const existingAttendees = liveMeeting.attendees || [];
    const existingAttendeeMap = new Map();
    
    existingAttendees.forEach(attendee => {
      const userId = attendee.user._id ? attendee.user._id.toString() : attendee.user.toString();
      existingAttendeeMap.set(userId, attendee);
    });
    
    // Transform new attendees array to proper schema format
    updates.attendees = updates.attendees.map(userId => {
      const existingAttendee = existingAttendeeMap.get(userId.toString());
      if (existingAttendee) {
        // Keep existing attendee data
        return {
          user: userId,
          hasJoined: existingAttendee.hasJoined || false,
          joinedAt: existingAttendee.joinedAt
        };
      } else {
        // New attendee with default values
        return {
          user: userId,
          hasJoined: false
        };
      }
    });
    
    console.log('✅ Transformed attendees:', updates.attendees);
  }

  // Update the meeting
  const updatedMeeting = await LiveMeeting.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  )
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email');

  res.status(200).json({
    success: true,
    message: 'تم تحديث الاجتماع المباشر بنجاح',
    liveMeeting: updatedMeeting
  });
});

// @desc    Delete live meeting
// @route   DELETE /api/v1/live-meetings/:id
// @access  Admin
export const deleteLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  await LiveMeeting.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'تم حذف الاجتماع المباشر بنجاح'
  });
});

// @desc    Join live meeting
// @route   POST /api/v1/live-meetings/:id/join
// @access  User
export const joinLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Check if meeting is live
  if (liveMeeting.status !== 'live') {
    return next(new AppError('الاجتماع غير مباشر حالياً', 400));
  }

  // Check if user is an attendee
  const isAttendee = liveMeeting.isUserAttendee(userId);
  
  // Debug logging for join authorization
  console.log('🔐 Join authorization check:', {
    userId: userId,
    meetingId: id,
    isAttendee: isAttendee,
    attendees: liveMeeting.attendees.map(a => ({
      userId: a.user.toString(),
      matches: a.user.toString() === userId.toString()
    }))
  });
  
  if (!isAttendee) {
    console.log('❌ Join denied - user is not attendee');
    return next(new AppError('غير مصرح لك بالانضمام لهذا الاجتماع', 403));
  }
  
  console.log('✅ Join access granted');

  // Mark user as joined
  const userIdStr = userId.toString();
  const attendeeIndex = liveMeeting.attendees.findIndex(attendee => {
    const attendeeUserId = attendee.user._id ? attendee.user._id.toString() : attendee.user.toString();
    return attendeeUserId === userIdStr;
  });

  if (attendeeIndex > -1) {
    liveMeeting.attendees[attendeeIndex].hasJoined = true;
    liveMeeting.attendees[attendeeIndex].joinedAt = new Date();
    await liveMeeting.save();
  }

  res.status(200).json({
    success: true,
    message: 'تم الانضمام للاجتماع بنجاح',
    meetingLink: liveMeeting.googleMeetLink
  });
});

// @desc    Add attendees to live meeting
// @route   POST /api/v1/live-meetings/:id/attendees
// @access  Admin
export const addAttendees = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { attendees } = req.body;

  console.log('Debug - addAttendees request:', { id, attendees });

  if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
    return next(new AppError('قائمة الحضور مطلوبة', 400));
  }

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  console.log('Debug - Found meeting:', { meetingId: liveMeeting._id, currentAttendees: liveMeeting.attendees.length });

  // Validate all attendees exist
  const validAttendees = [];
  const invalidAttendees = [];
  
  for (const attendeeId of attendees) {
    console.log('Debug - Checking attendeeId:', attendeeId);
    
    // Skip null or undefined values
    if (!attendeeId) {
      console.log('Debug - Skipping null/undefined attendeeId');
      invalidAttendees.push(attendeeId);
      continue;
    }
    
    const user = await User.findById(attendeeId);
    console.log('Debug - User lookup result:', { attendeeId, userFound: !!user });
    
    if (user && !liveMeeting.isUserAttendee(attendeeId)) {
      validAttendees.push({ user: attendeeId });
      console.log('Debug - Added valid attendee:', attendeeId);
    } else if (!user) {
      console.log('Debug - User not found:', attendeeId);
      invalidAttendees.push(attendeeId);
    } else {
      console.log('Debug - User already attendee:', attendeeId);
    }
  }

  console.log('Debug - Validation results:', { 
    validAttendees: validAttendees.length, 
    invalidAttendees: invalidAttendees.length,
    invalidIds: invalidAttendees
  });

  // Check if adding attendees would exceed max limit
  // Capacity is unlimited now; no maxAttendees enforcement

  // Add attendees
  liveMeeting.attendees.push(...validAttendees);
  await liveMeeting.save();

  await liveMeeting.populate('attendees.user', 'fullName email');

  console.log('Debug - Final attendees after save:', liveMeeting.attendees.map(a => ({ userId: a.user?._id, userExists: !!a.user })));

  res.status(200).json({
    success: true,
    message: 'تم إضافة الحضور بنجاح',
    attendeesAdded: validAttendees.length,
    totalAttendees: liveMeeting.attendees.length,
    debug: {
      invalidAttendees: invalidAttendees,
      validAttendeesCount: validAttendees.length
    }
  });
});

// @desc    Remove attendee from live meeting
// @route   DELETE /api/v1/live-meetings/:id/attendees/:attendeeId
// @access  Admin
export const removeAttendee = asyncHandler(async (req, res, next) => {
  const { id, attendeeId } = req.params;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  const removed = liveMeeting.removeAttendee(attendeeId);

  if (!removed) {
    return next(new AppError('الحضور غير موجود في الاجتماع', 404));
  }

  await liveMeeting.save();

  res.status(200).json({
    success: true,
    message: 'تم إزالة الحضور بنجاح'
  });
});

// @desc    Get live meeting statistics
// @route   GET /api/v1/live-meetings/stats
// @access  Admin
export const getLiveMeetingStats = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const stats = await LiveMeeting.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const upcomingCount = await LiveMeeting.countDocuments({
    status: 'scheduled',
    scheduledDate: { $gte: now }
  });

  const liveCount = await LiveMeeting.countDocuments({
    status: 'live'
  });

  const completedCount = await LiveMeeting.countDocuments({
    status: 'completed'
  });

  const totalCount = await LiveMeeting.countDocuments();

  // Total attendees across all meetings
  const attendeesStats = await LiveMeeting.aggregate([
    { $unwind: '$attendees' },
    {
      $group: {
        _id: null,
        totalAttendees: { $sum: 1 },
        joinedAttendees: {
          $sum: { $cond: ['$attendees.hasJoined', 1, 0] }
        }
      }
    }
  ]);

  const attendeesData = attendeesStats[0] || { totalAttendees: 0, joinedAttendees: 0 };

  res.status(200).json({
    success: true,
    message: 'تم استرجاع إحصائيات الاجتماعات المباشرة بنجاح',
    stats: {
      total: totalCount,
      upcoming: upcomingCount,
      live: liveCount,
      completed: completedCount,
      totalAttendees: attendeesData.totalAttendees,
      joinedAttendees: attendeesData.joinedAttendees,
      attendanceRate: attendeesData.totalAttendees > 0 
        ? ((attendeesData.joinedAttendees / attendeesData.totalAttendees) * 100).toFixed(2)
        : 0
    }
  });
});

// Send email reminders for a specific meeting
export const sendMeetingReminders = async (req, res) => {
  try {
    const { meetingId } = req.body;
    
    console.log('📧 sendMeetingReminders called with meetingId:', meetingId);

    if (!meetingId) {
      console.log('❌ No meetingId provided');
      return res.status(400).json({
        success: false,
        message: 'معرف الجلسة مطلوب'
      });
    }

    // Find the meeting with populated attendees
    const meeting = await LiveMeeting.findById(meetingId)
      .populate('attendees.user', 'fullName email phoneNumber')
      .populate('instructor', 'name email')
      .populate('stage', 'name')
      .populate('subject', 'title');

    console.log('📧 Found meeting:', meeting ? { id: meeting._id, title: meeting.title, attendeesCount: meeting.attendees?.length } : 'NOT FOUND');

    if (!meeting) {
      console.log('❌ Meeting not found');
      return res.status(404).json({
        success: false,
        message: 'الجلسة غير موجودة'
      });
    }

    if (meeting.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'يمكن إرسال التذكيرات للجلسات المجدولة فقط'
      });
    }

    // Check if meeting is in the future
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    
    if (meetingDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إرسال تذكيرات للجلسات الماضية'
      });
    }

    // Prepare email data
    const meetingDateFormatted = meetingDate.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const meetingTimeFormatted = meetingDate.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const durationHours = Math.floor(meeting.duration / 60);
    const durationMinutes = meeting.duration % 60;
    const durationText = durationHours > 0 
      ? `${durationHours} ساعة${durationMinutes > 0 ? ` و ${durationMinutes} دقيقة` : ''}`
      : `${durationMinutes} دقيقة`;

    console.log('📧 Sending emails to attendees:', meeting.attendees.map(a => ({ name: a.user.fullName, email: a.user.email })));

    // Send emails to all attendees
    const emailPromises = meeting.attendees.map(async (attendee) => {
      if (!attendee.user.email) {
        console.log(`Skipping user ${attendee.user.fullName} - no email address`);
        return { success: false, user: attendee.user.fullName, reason: 'لا يوجد بريد إلكتروني' };
      }

      console.log(`📧 Sending email to ${attendee.user.fullName} (${attendee.user.email})`);

      try {
        const emailSubject = `تذكير: جلسة مباشرة - ${meeting.title}`;
        const emailHtml = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: #5b2233; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">تذكير بجلسة مباشرة</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">منصة المكتبة التعليمية</p>
              </div>
              
              <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #5b2233; margin-top: 0;">مرحباً ${attendee.user.fullName}</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  نود تذكيرك بجلسة مباشرة مجدولة لك:
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #5b2233;">
                  <h3 style="color: #5b2233; margin-top: 0;">تفاصيل الجلسة</h3>
                  <p style="margin: 8px 0;"><strong>العنوان:</strong> ${meeting.title}</p>
                  <p style="margin: 8px 0;"><strong>الوصف:</strong> ${meeting.description}</p>
                  <p style="margin: 8px 0;"><strong>التاريخ:</strong> ${meetingDateFormatted}</p>
                  <p style="margin: 8px 0;"><strong>الوقت:</strong> ${meetingTimeFormatted}</p>
                  <p style="margin: 8px 0;"><strong>المدة:</strong> ${durationText}</p>
                  ${meeting.instructor ? `<p style="margin: 8px 0;"><strong>المدرب:</strong> ${meeting.instructor.name}</p>` : ''}
                  ${meeting.stage ? `<p style="margin: 8px 0;"><strong>المرحلة:</strong> ${meeting.stage.name}</p>` : ''}
                  ${meeting.subject ? `<p style="margin: 8px 0;"><strong>المادة:</strong> ${meeting.subject.title}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${meeting.googleMeetLink}" 
                     style="background-color: #5b2233; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                    انضم إلى الجلسة الآن
                  </a>
                </div>
                
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #1976d2;">
                    <strong>ملاحظة:</strong> يرجى الانضمام إلى الجلسة قبل 5 دقائق من الموعد المحدد للتأكد من جودة الاتصال.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  مع تحيات فريق المكتبة التعليمية<br>
                  للاستفسارات، يرجى التواصل معنا عبر البريد الإلكتروني
                </p>
              </div>
            </div>
          `;

        await sendEmail(attendee.user.email, emailSubject, 'Meeting reminder', emailHtml);
        console.log(`✅ Email sent successfully to ${attendee.user.email}`);
        return { success: true, user: attendee.user.fullName, email: attendee.user.email };
      } catch (error) {
        console.error(`❌ Failed to send email to ${attendee.user.email}:`, error);
        return { success: false, user: attendee.user.fullName, email: attendee.user.email, reason: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `تم إرسال ${successful} تذكير بنجاح${failed > 0 ? `، فشل في إرسال ${failed} تذكير` : ''}`,
      results: {
        total: results.length,
        successful,
        failed,
        details: results
      }
    });

  } catch (error) {
    console.error('Error in sendMeetingReminders:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال التذكيرات',
      error: error.message
    });
  }
};
