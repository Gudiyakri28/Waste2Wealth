import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = randomInt(100000, 999999);

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO otps (email, otp, created_at) VALUES (?, ?, NOW())',
      [email, otp]
    );

    await connection.end();

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP Code - Waste2Wealth',
      text: `Your OTP for verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
