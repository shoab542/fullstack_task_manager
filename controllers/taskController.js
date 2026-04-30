const db = require("../db");
const { successResponse } = require("../utils/response");
const { getTaskServices , createTaskService, getTaskByIdServices } = require("../services/taskServices");

/* =========================
   GET TASKS (pagination + search + sort)
========================= */
exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    const sortOrder = req.query.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    const { rows, total } = await getTaskServices(
      req.user.id,
      search,
      limit,
      offset,
      sortOrder
    );

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
    const userId = req.user.id;

    if (!title || title.trim().length === 0) {
      return next(new Error("Title is required"));
    }
    const {rows}= await createTaskService(title, userId);

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
    
    const {rows}= await getTaskByIdServices(id, req.user.id, next);
    successResponse(res, rows, "Task fetched successfully");
  } catch (err) {
    next(err);
  }
}

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
      "UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?",
      [title, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return next(new Error("Invalid task id"));
    }

    const [updated] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id]);

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
    if(req.user.role === "admin"){
      const [result] = await db.query(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [id, req.user.id]
      );
  
      if (result.affectedRows === 0) {
        return next(new Error("Task not found"));
      }
      successResponse(res, null, "Task deleted");
    }else{
     return next(new Error("You have not permission to delete this task."))
    }

  } catch (err) {
    next(err);
  }
};
