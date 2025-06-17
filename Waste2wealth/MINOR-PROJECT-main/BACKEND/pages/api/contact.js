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

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const insertQuery = `
      INSERT INTO contact_messages (name, email, message, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(insertQuery, [name, email, message]);

    await connection.end();

    res.status(200).json({ success: true, message: 'Your message has been submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
