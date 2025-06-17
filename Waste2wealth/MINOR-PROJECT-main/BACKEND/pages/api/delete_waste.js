import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Waste item ID is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const deleteQuery = 'DELETE FROM waste_items WHERE id = ?';

    const [result] = await connection.execute(deleteQuery, [id]);

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Waste item not found' });
    }

    res.status(200).json({ success: true, message: 'Waste item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
