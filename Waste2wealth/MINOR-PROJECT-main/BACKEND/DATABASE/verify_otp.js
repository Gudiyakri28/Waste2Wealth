import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.execute(
      'SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (results.length === 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'No OTP found for this email' });
    }

    const latestOTP = results[0];

    if (latestOTP.otp !== otp) {
      await connection.end();
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Optional: delete or mark OTP as used
    await connection.execute('DELETE FROM otp_verifications WHERE id = ?', [latestOTP.id]);
    await connection.end();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
