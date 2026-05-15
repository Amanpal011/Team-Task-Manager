const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title } = req.body;

  const task = new Task({ title });

  await task.save();

  res.json(task);
});

module.exports = router;