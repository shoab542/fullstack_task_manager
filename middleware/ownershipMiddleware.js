const db = require("../db");
const AppError = require("../utils/AppError");

const checkOwnership = async (req, res, next) => {
  try {
   
    const taskId = req.params.id;
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);

    if (rows.length === 0) {
      throw new AppError("Task not Found", 404);
    }

    const task = rows[0];

    if (req.user.role === "admin") {
        console.log("hello");
      return next();
    }
   
    if (task.user_id !== userId) {
      throw new AppError("Forbidden: Not your task", 403);
    }
    console.log("hi");

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = checkOwnership;
