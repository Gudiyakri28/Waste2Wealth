import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

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

  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const insertQuery = `
      INSERT INTO users (name, email, phone, password, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(insertQuery, [name, email, phone, password]);
    await connection.end();

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Thank You for Registering - Waste2Wealth',
      text: `Hi ${name},\n\nThank you for registering on Waste2Wealth. We are excited to have you onboard.\n\nRegards,\nWaste2Wealth Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Registration successful. Confirmation email sent.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
