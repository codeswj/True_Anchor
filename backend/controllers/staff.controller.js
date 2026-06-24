const staffService = require('../services/staff.service');
const { success, error } = require('../utils/response');

const onboardMember = async (req, res, next) => {
    try {
        const {
            fullName,
            phone,
            pin,
            idNumber,
            email,
            kraPin,
            maritalStatus,
            dateOfBirth,
            gender,
            physicalAddress,
            signatureFilePath,
            passportPhotoFilePath,
        } = req.body;

        if (!fullName || !phone) {
            return error(res, 'fullName and phone are required', 400);
        }

        const data = await staffService.onboardNewMember({
            fullName,
            phone,
            pin,
            idNumber,
            email,
            kraPin,
            maritalStatus,
            dateOfBirth,
            gender,
            physicalAddress,
            signatureFilePath,
            passportPhotoFilePath,
        });

        return success(res, data, 'Member onboarded successfully', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const listMembers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const status = req.query.status || 'all';
        const data = await staffService.listMembers({ limit, offset, status });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await staffService.getMember(id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { onboardMember, listMembers, getMember };