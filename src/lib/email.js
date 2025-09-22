import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an OTP email via Gmail
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 */
export async function sendOtpEmail(to, otp) {
  try {
    const mailOptions = {
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Password Reset OTP",
      text: `Your OTP code is: ${otp}. It is valid for ${process.env.OTP_EXP_MIN || 10} minutes.`,
      html: `
        <p>Use this code to reset your password:</p>
        <h2 style="letter-spacing:3px">${otp}</h2>
        <p>It expires in ${process.env.OTP_EXP_MIN || 10} minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return false;
  }
}
