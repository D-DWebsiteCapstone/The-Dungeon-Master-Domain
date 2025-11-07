import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
console.log('Email user:', process.env.EMAIL_USER);
console.log('Email pass present:', !!process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function sendVerificationEmail(email, username, code) {
  const link = `${FRONTEND_URL}/verify?code=${code}`;
  await transporter.sendMail({
    from: `"DnD Campaign Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your DnD Campaign Manager account",
    html: `
      <p>Welcome, ${username}!</p>
      <p>Click below to verify your account:</p>
      <a href="${link}">${link}</a>
    `
  });
}

export async function sendPasswordResetEmail(email, token) {
  const link = `${FRONTEND_URL}/reset?token=${token}`;
  try {
    await transporter.sendMail({
      from: `"DnD Campaign Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error('Error sending password reset email:', err);
  }
}

