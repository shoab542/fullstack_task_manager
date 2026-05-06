const db = require("../db");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/AppError");

/* =========================
   GET TASKS
========================= */
exports.getTaskServices = async (userId, role, search, limit, offset, sortOrder) => {
  let baseSql = "FROM tasks";
  let values = [];

  // 👇 Admin vs User
  if (role !== "admin") {
    baseSql += " WHERE user_id = ?";
    values.push(userId);
  }

  if (search) {
    baseSql += values.length ? " AND title LIKE ?" : " WHERE title LIKE ?";
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

/* =========================
   CREATE TASK
========================= */
exports.createTaskService = async (title, userId, image) => {
  const [result] = await db.query(
    "INSERT INTO tasks (title, user_id, image) VALUES (?, ?, ?)",
    [title, userId, image]
  );

  const [rows] = await db.query(
    "SELECT * FROM tasks WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

/* =========================
   GET TASK BY ID
========================= */
exports.getTaskByIdServices = async (id, userId, role) => {
  let query, values;

  if (role === "admin") {
    query = "SELECT * FROM tasks WHERE id = ?";
    values = [id];
  } else {
    query = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";
    values = [id, userId];
  }

  const [rows] = await db.query(query, values);

  if (rows.length === 0) {
    throw new AppError("Task not found", 404);
  }

  return rows[0];
};

/* =========================
   UPDATE TASK
========================= */
exports.updateTaskServices = async (title, id, userId, role, newImage) => {
  let rows;

  // 1. Get existing task
  if (role === "admin") {
    [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
  } else {
    [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }

  if (rows.length === 0) {
    throw new AppError("Task not found", 404);
  }else {
    
  }

  const task = rows[0];

  let finalImage = task.image;

  // 2. If new image uploaded
  if (newImage) {
    // delete old image
    if (task.image) {
      const filePath = path.join(__dirname, "..", "uploads", task.image);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    finalImage = newImage;
  }

  // 3. Update DB
  let result;

  if (role === "admin") {
    [result] = await db.query(
      "UPDATE tasks SET title = ?, image = ? WHERE id = ?",
      [title, finalImage, id]
    );
  } else {
    [result] = await db.query(
      "UPDATE tasks SET title = ?, image = ? WHERE id = ? AND user_id = ?",
      [title, finalImage, id, userId]
    );
  }

  const [updated] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

  return updated[0];
};

/* =========================
   DELETE TASK
========================= */
exports.deleteTaskServices = async (id, userId, role) => {
  let rows;

  // 1. Get task first
  if (role === "admin") {
    [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
  } else {
    [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }

  if (rows.length === 0) {
    throw new AppError("Task not found", 404);
  }

  const task = rows[0];
  // 2. Delete file (if exists)
  if (task.image) {
    const filePath = path.join(__dirname, "..", "uploads", task.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // 3. Delete from DB (your original logic)
  let result;

  if (role === "admin") {
    [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);
  } else {
    [result] = await db.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }

  return result;
};