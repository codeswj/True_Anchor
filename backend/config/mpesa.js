module.exports = {
    consumerKey:    process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode:      process.env.MPESA_SHORTCODE    || '174379',
    passkey:        process.env.MPESA_PASSKEY,
    callbackUrl:    process.env.MPESA_CALLBACK_URL,
    env:            process.env.MPESA_ENV          || 'sandbox',
    baseUrl() {
        return this.env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    },
};
