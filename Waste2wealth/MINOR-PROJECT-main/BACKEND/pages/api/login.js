import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.status(200).json({ success: true, message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
