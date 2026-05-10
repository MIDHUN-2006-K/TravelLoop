import nodemailer from 'nodemailer';

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email, otp) {
  // In development, just log the OTP
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n========================================`);
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Only actually send if SMTP credentials are configured
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@traveloop.app',
        to: email,
        subject: 'Traveloop - Password Reset OTP',
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3366ff;">🌍 Traveloop</h2>
            <p>Your password reset code is:</p>
            <div style="background: #f0f4ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3366ff;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error('Email send failed (non-critical):', error.message);
    // Don't throw — OTP was already logged to console for dev
  }
}
