const db = require("../db");

exports.getTaskServices = async (userId, search, limit, offset, sortOrder) => {
  let baseSql = "FROM tasks WHERE user_id = ?";
  let values = [userId];

  if (search) {
    baseSql += " AND title LIKE ?";
    values.push(`%${search}%`);
  }
  const dataSql = `
  SELECT * ${baseSql}
  ORDER BY id ${sortOrder}
  LIMIT ? OFFSET ?
   `;

  const [rows] = await db.query(dataSql, [...values, limit, offset]);

  const countSql = `SELECT COUNT(*) as total ${baseSql}`;
  const [countResult] = await db.query(countSql, values);

  return {
    rows,
    total: countResult[0].total,
  };
};

exports.createTaskService = async (title, userId) => {
  const [result] = await db.query(
    "INSERT INTO tasks(title,user_id) VALUES(?,?)",
    [title, userId]
  );
  const [rows] = await db.query(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    [result.insertId, userId]
  );
  return {
    rows,
  };
};
exports.getTaskByIdServices = async (id, userId, next) => {
  const [rows] = await db.query(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (rows.length === 0) {
    return next(new Error("Task not found with given id"));
  }
  return{
    rows
  }
};
