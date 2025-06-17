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

  const { category, description, address, contact, imageUrl } = req.body;

  if (!category || !description || !address || !contact || !imageUrl) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      INSERT INTO waste_items (category, description, address, contact, imageUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(query, [
      category,
      description,
      address,
      contact,
      imageUrl
    ]);

    await connection.end();

    res.status(201).json({ success: true, insertedId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}