import UnitAccessCode from "../models/unitAccessCode.model.js";
import UnitAccess from "../models/unitAccess.model.js";
import Course from "../models/course.model.js";
import userModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Admin: generate one-time codes to unlock a unit for a limited duration
export const generateUnitAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, unitId, accessStartAt, accessEndAt, quantity = 1, codeExpiresAt } = req.body;
    const adminId = req.user.id;

    if (!courseId) {
        throw new ApiError(400, 'courseId is required');
    }
    if (!unitId) {
        throw new ApiError(400, 'unitId is required');
    }
    // Validate required window
    if (!accessStartAt || !accessEndAt) {
        throw new ApiError(400, 'accessStartAt and accessEndAt are required');
    }
    if (new Date(accessEndAt) <= new Date(accessStartAt)) {
        throw new ApiError(400, 'accessEndAt must be after accessStartAt');
    }
    if (quantity < 1 || quantity > 200) {
        throw new ApiError(400, 'quantity must be between 1 and 200');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, 'Course not found');
    }

    // Check if unit exists in the course
    const unit = course.units.find(u => u._id.toString() === unitId);
    if (!unit) {
        console.log('Debug - Unit Access Code Generation:');
        console.log('Requested unitId:', unitId);
        console.log('Course units:', course.units.map(u => ({ id: u._id.toString(), title: u.title })));
        throw new ApiError(404, 'Unit not found in this course');
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
        let codeValue;
        let isUnique = false;
        while (!isUnique) {
            codeValue = UnitAccessCode.generateCode();
            const existing = await UnitAccessCode.findOne({ code: codeValue });
            isUnique = !existing;
        }

        const code = await UnitAccessCode.create({
            code: codeValue,
            courseId,
            unitId,
            accessStartAt: new Date(accessStartAt),
            accessEndAt: new Date(accessEndAt),
            codeExpiresAt: codeExpiresAt ? new Date(codeExpiresAt) : undefined,
            createdBy: adminId
        });
        codes.push(code);
    }

    res.status(201).json(new ApiResponse(201, codes, 'Unit access code(s) generated'));
});

// User: redeem code to unlock unit
export const redeemUnitAccessCode = asyncHandler(async (req, res) => {
    const { code, courseId, unitId } = req.body;
    const userId = req.user.id;
    if (!code) throw new ApiError(400, 'code is required');
    if (!courseId) throw new ApiError(400, 'courseId is required');
    if (!unitId) throw new ApiError(400, 'unitId is required');

    const redeemable = await UnitAccessCode.findRedeemable(code);
    if (!redeemable) throw new ApiError(400, 'Invalid or expired code');

    // Check if the code is for the correct course and unit
    if (redeemable.courseId.toString() !== courseId) {
        throw new ApiError(400, 'This code is not valid for this course');
    }
    if (redeemable.unitId.toString() !== unitId) {
        throw new ApiError(400, 'This code is not valid for this unit');
    }

    // Ensure course exists
    const course = await Course.findById(redeemable.courseId);
    if (!course) throw new ApiError(404, 'Course not found for this code');

    // Debug logging
    console.log('Debug - Unit Access Code Redemption:');
    console.log('Request unitId:', unitId);
    console.log('Code unitId:', redeemable.unitId);
    console.log('Course units:', course.units.map(u => ({ id: u._id.toString(), title: u.title })));

    // Check if unit exists in the course
    const unit = course.units.find(u => u._id.toString() === unitId);
    if (!unit) {
        console.log('Unit not found. Available unit IDs:', course.units.map(u => u._id.toString()));
        throw new ApiError(404, 'Unit not found in this course');
    }

    const now = new Date();
    // Compute access window based on fixed date range
    let start = new Date(redeemable.accessStartAt);
    let end = new Date(redeemable.accessEndAt);
    if (now > end) throw new ApiError(400, 'This code is expired for its access window');

    // Create access record
    const access = await UnitAccess.create({
        userId,
        courseId: redeemable.courseId,
        unitId: redeemable.unitId,
        accessStartAt: start,
        accessEndAt: end,
        source: 'code',
        codeId: redeemable._id
    });

    // Mark code as used
    redeemable.isUsed = true;
    redeemable.usedBy = userId;
    redeemable.usedAt = now;
    await redeemable.save();

    // Log wallet transaction entry (access code usage)
    await userModel.findByIdAndUpdate(userId, {
        $push: {
            walletTransactions: {
                type: 'unit_access_code',
                amount: 0,
                description: `Unit access granted via code for ${unit.title}`,
                timestamp: new Date()
            }
        }
    });

    res.status(200).json(new ApiResponse(200, { access, unit }, 'Unit access granted'));
});

// Admin: list unit access codes
export const listUnitAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, unitId, q, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (courseId) filter.courseId = courseId;
    if (unitId) filter.unitId = unitId;
    if (q) {
        filter.$or = [
            { code: { $regex: q, $options: 'i' } },
            { 'usedBy.email': { $regex: q, $options: 'i' } }
        ];
    }

    const codes = await UnitAccessCode.find(filter)
        .populate('courseId', 'title')
        .populate('usedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await UnitAccessCode.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(new ApiResponse(200, {
        codes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
        }
    }, 'Unit access codes retrieved'));
});

// Admin: delete single unit access code
export const deleteUnitAccessCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const code = await UnitAccessCode.findById(id);
    if (!code) {
        throw new ApiError(404, 'Unit access code not found');
    }

    if (code.isUsed) {
        throw new ApiError(400, 'Cannot delete used code');
    }

    await UnitAccessCode.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, 'Unit access code deleted'));
});

// Admin: bulk delete unit access codes
export const bulkDeleteUnitAccessCodes = asyncHandler(async (req, res) => {
    const { ids, courseId, unitId, onlyUnused = true } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'ids array is required');
    }

    let filter = { _id: { $in: ids } };
    if (courseId) filter.courseId = courseId;
    if (unitId) filter.unitId = unitId;
    if (onlyUnused) filter.isUsed = false;

    const result = await UnitAccessCode.deleteMany(filter);

    res.status(200).json(new ApiResponse(200, { deletedCount: result.deletedCount }, 'Unit access codes deleted'));
});

// Check if user has access to a unit
export const checkUnitAccess = asyncHandler(async (req, res) => {
    const { courseId, unitId } = req.params;
    const userId = req.user.id;

    const access = await UnitAccess.findOne({
        userId,
        courseId,
        unitId,
        accessEndAt: { $gt: new Date() }
    }).sort({ accessEndAt: -1 });

    res.status(200).json(new ApiResponse(200, {
        hasAccess: !!access,
        accessEndAt: access?.accessEndAt || null,
        source: access?.source || null
    }, 'Unit access checked'));
});
