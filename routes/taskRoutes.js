const express = require('express');
const router = express.Router();
const {getTasks, createTask, updateTask, deleteTask, getTaskById} = require('../controller/taskController');

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;