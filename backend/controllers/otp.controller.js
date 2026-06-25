import * as otpService from '../services/otp.service.js';

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        await otpService.sendOtp(email);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await otpService.verifyOtp(email, otp);
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(400).json({ error: "Invalid or expired OTP" });
    }
};