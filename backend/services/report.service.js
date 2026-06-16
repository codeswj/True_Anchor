const {
    getSystemSummary,
    getTransactionVolumeByDay,
    getLoanStatsByType,
    getTransactionSummaryByType,
    getMemberReport,
    getAllMembersReport,
} = require('../queries/report.queries');

const getGeneralReport = async ({ days = 30 } = {}) => {
    const [summary, volume, loans, txns] = await Promise.all([
        getSystemSummary(),
        getTransactionVolumeByDay({ days }),
        getLoanStatsByType(),
        getTransactionSummaryByType(),
    ]);
    return { summary, volume, loans, txns };
};

const getMemberReportById = async (userId) => {
    const report = await getMemberReport(userId);
    if (!report) throw { statusCode: 404, message: 'Member not found' };
    return report;
};

const listMembersReport = async () => {
    return getAllMembersReport();
};

module.exports = { getGeneralReport, getMemberReportById, listMembersReport };