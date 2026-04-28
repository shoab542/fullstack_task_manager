const db = require("../db");
const { successResponse } = require("../utils/response");

/* =========================
   GET TASKS (pagination + search + sort)
========================= */
exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    const sortOrder =
      req.query.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    let baseSql = "FROM tasks";
    let values = [];

    if (search) {
      baseSql += " WHERE title LIKE ?";
      values.push(`%${search}%`);
    }

    // Data query
    const dataSql = `
      SELECT * ${baseSql}
      ORDER BY id ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [
      ...values,
      limit,
      offset,
    ]);

    // Count query
    const countSql = `SELECT COUNT(*) as total ${baseSql}`;
    const [countResult] = await db.query(countSql, values);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREATE TASK
========================= */
exports.createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return next(new Error("Title is required"));
    }

    const [result] = await db.query(
      "INSERT INTO tasks SET ?",
      { title }
    );

    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [result.insertId]
    );

    successResponse(res, rows[0], "Task created");
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET TASK BY ID
========================= */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return next(new Error("Task not found with given id"));
    }

    successResponse(res, rows[0], "Task fetched successfully");
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE TASK
========================= */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return next(new Error("Title is required"));
    }

    const [result] = await db.query(
      "UPDATE tasks SET title = ? WHERE id = ?",
      [title, id]
    );

    if (result.affectedRows === 0) {
      return next(new Error("Invalid task id"));
    }

    const [updated] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    successResponse(res, updated[0], "Task updated");
  } catch (err) {
    next(err);
  }
};

/* =========================
   DELETE TASK
========================= */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return next(new Error("Task not found"));
    }

    successResponse(res, null, "Task deleted");
  } catch (err) {
    next(err);
  }
};