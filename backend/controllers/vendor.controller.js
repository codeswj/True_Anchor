const vendorService = require('../services/vendor.service');
const { success, error } = require('../utils/response');

const addVendor = async (req, res, next) => {
    try {
        const {
            vendorName,
            contactPerson,
            phone,
            email,
            kraPin,
            paymentTerms,
            physicalAddress,
            status,
            notes,
        } = req.body;

        const data = await vendorService.addVendor({
            vendorName,
            contactPerson,
            phone,
            email,
            kraPin,
            paymentTerms,
            physicalAddress,
            status,
            notes,
            createdBy: req.user?.id,
        });

        return success(res, data, 'Vendor added successfully', 201);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const listVendors = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const data = await vendorService.getVendors({ search, limit, offset });
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const getVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await vendorService.getVendor(id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const updateVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await vendorService.editVendor(id, req.body);
        return success(res, data, 'Vendor updated successfully');
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

const deleteVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await vendorService.removeVendor(id);
        return success(res, data);
    } catch (err) {
        if (err.statusCode) return error(res, err.message, err.statusCode);
        next(err);
    }
};

module.exports = { addVendor, listVendors, getVendor, updateVendor, deleteVendor };