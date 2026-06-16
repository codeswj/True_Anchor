const reportService   = require('../services/report.service');
const { success, error } = require('../utils/response');

const generalReport = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await reportService.getGeneralReport({ days });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const memberReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await reportService.getMemberReportById(id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const membersList = async (req, res, next) => {
    try {
        const data = await reportService.listMembersReport();
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { generalReport, memberReport, membersList };