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

  const { user_lat, user_lng, radius_km } = req.body;

  if (!user_lat || !user_lng || !radius_km) {
    return res.status(400).json({ message: 'Latitude, Longitude and Radius are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT *,
        ( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) *
          cos( radians( lng ) - radians(?) ) + sin( radians(?) ) *
          sin( radians( lat ) ) ) ) AS distance
      FROM waste_items
      HAVING distance <= ?
      ORDER BY distance;
    `;

    const [results] = await connection.execute(query, [user_lat, user_lng, user_lat, radius_km]);

    await connection.end();

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
