// ============================================================
// DEV MODE: Mock email service — prints OTP to console
// No Gmail credentials needed. Use any dummy email to sign up.
// Switch back to real Nodemailer for production.
// ============================================================

async function sendOTPEmail(to, otp) {
    console.log(`\n========================================`);
    console.log(`📧 OTP EMAIL (Signup Verification)`);
    console.log(`   To:  ${to}`);
    console.log(`   OTP: ${otp}`);
    console.log(`========================================\n`);
}

async function sendPasswordResetOTPEmail(to, otp) {
    console.log(`\n========================================`);
    console.log(`🔑 OTP EMAIL (Password Reset)`);
    console.log(`   To:  ${to}`);
    console.log(`   OTP: ${otp}`);
    console.log(`========================================\n`);
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
