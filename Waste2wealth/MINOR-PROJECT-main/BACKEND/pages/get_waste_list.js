import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT id, title, description, category_id, location, image_url, created_at
      FROM waste_items
      ORDER BY created_at DESC;
    `;

    const [results] = await connection.execute(query);

    await connection.end();

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
