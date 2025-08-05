import db from '../config/database.js';

class Photo {
  static async create(filename, comment) {
    const [result] = await db.query(
      'INSERT INTO photos (filename, comment, status) VALUES (?, ?, ?)',
      [filename, comment, 'not_used']
    );
    return { id: result.insertId, filename, comment, status: 'not_used' };
  }

  static async getAll(status = null) {
    let query = 'SELECT * FROM photos';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findOneUnused() {
    const [rows] = await db.query(
      "SELECT * FROM photos WHERE status = 'not_used' ORDER BY created_at ASC LIMIT 1"
    );
    return rows[0];
  }

  static async updateStatus(id, status, instagram_post_id = null) {
    const [result] = await db.query(
      'UPDATE photos SET status = ?, instagram_post_id = ?, posted_at = ? WHERE id = ?',
      [status, instagram_post_id, new Date(), id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM photos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM photos WHERE id = ?', [id]);
    return rows[0];
  }
}

export default Photo;