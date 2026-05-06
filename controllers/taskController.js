const { successResponse } = require("../utils/response");
const {
  getTaskServices,
  createTaskService,
  getTaskByIdServices,
  updateTaskServices,
  deleteTaskServices,
} = require("../services/taskServices");

/* =========================
   GET TASKS
========================= */
exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    const sortOrder =
      req.query.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    const { rows, total } = await getTaskServices(
      req.user.id,
      req.user.role,
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
    next(err); // ✅ IMPORTANT
  }
};

/* =========================
   CREATE TASK
========================= */
exports.createTask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const image = req.file ? req.file.filename : null;

    const row = await createTaskService(title, req.user.id, image);

    successResponse(res, row, "Task created");
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET TASK BY ID
========================= */
exports.getTaskById = async (req, res, next) => {
  try {
    const row = await getTaskByIdServices(
      req.params.id,
      req.user.id,
      req.user.role
    );

    successResponse(res, row, "Task fetched successfully");
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE TASK
========================= */
exports.updateTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      throw new Error("Title is required");
    }

    const image = req.file ? req.file.filename : null;

    const row = await updateTaskServices(
      title,
      req.params.id,
      req.user.id,
      req.user.role,
      image
    );

    successResponse(res, row, "Task updated");
  } catch (err) {
    // 🔥 IMPORTANT: cleanup uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("❌ Deleted unused file:", filePath);
      }
    }

    next(err);
  }
};

/* =========================
   DELETE TASK
========================= */
exports.deleteTask = async (req, res, next) => {
  try {
    await deleteTaskServices(
      req.params.id,
      req.user.id,
      req.user.role
    );

    successResponse(res, null, "Task deleted");
  } catch (err) {
    next(err);
  }
};