const express = require('express');
const router = express.Router();
const authMiddleware= require('../middleware/authMiddleware');
const validate= require("../middleware/validate");
const {createTaskSchema, updateTaskSchema} = require("../validators/taskValidator")
const {getTasks, createTask, updateTask, deleteTask, getTaskById} = require('../controllers/taskController');
const checkOwnership = require('../middleware/ownershipMiddleware')
router.get('/',authMiddleware, getTasks);
router.get('/:id',authMiddleware,checkOwnership, getTaskById);
router.post('/',authMiddleware,validate(createTaskSchema), createTask);
router.put('/:id',authMiddleware,validate(updateTaskSchema),checkOwnership, updateTask);
router.delete('/:id',authMiddleware,checkOwnership, deleteTask);

module.exports = router;