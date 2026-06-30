const vendorQueries = require('../queries/vendor.queries');
const { createVendor, listVendors, getVendorById, updateVendor, deleteVendor } = vendorQueries;

const addVendor = async ({
    vendorName,
    contactPerson,
    phone,
    email,
    kraPin,
    paymentTerms,
    physicalAddress,
    status,
    notes,
    createdBy,
}) => {
    if (!vendorName || !phone) {
        throw { statusCode: 400, message: 'Vendor name and phone are required' };
    }

    const vendor = await createVendor({
        vendorName,
        contactPerson,
        phone,
        email,
        kraPin,
        paymentTerms,
        physicalAddress,
        status,
        notes,
        createdBy,
    });

    return { vendor };
};

const getVendors = async ({ search, limit, offset } = {}) => {
    const vendors = await listVendors({ search, limit, offset });
    return { vendors, total: vendors.length };
};

const getVendor = async (id) => {
    const vendor = await getVendorById(id);
    if (!vendor) throw { statusCode: 404, message: 'Vendor not found' };
    return vendor;
};

const editVendor = async (id, fields) => {
    const vendor = await updateVendor(id, fields);
    if (!vendor) throw { statusCode: 404, message: 'Vendor not found' };
    return vendor;
};

const removeVendor = async (id) => {
    const deleted = await deleteVendor(id);
    if (!deleted) throw { statusCode: 404, message: 'Vendor not found' };
    return { message: 'Vendor deleted successfully' };
};

module.exports = { addVendor, getVendors, getVendor, editVendor, removeVendor };