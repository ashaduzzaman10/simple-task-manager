// app essential

const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const todoSchema = require("../schemas/todoSchema");
const checkLogIn = require("../middlewares/checkLogin");
const userSchema = require("../schemas/userSchema");

const dotenv = require("dotenv");

// modeling

const Todo = mongoose.model("Todo", todoSchema);
const User = mongoose.model("User", userSchema);

// get all todo's

router.get("/", checkLogIn, async (req, res) => {
  try {
    const todos = await Todo.find()
      .populate("user", "name username -_id")
      .select({
        _id: 0,
        _v: 0,
        date: 0,
      })
      .limit(2);
    res.status(200).json({
      message: "Successfully getting all todos",
      todos: todos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

// get a todo
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Successfully getting a todo",
      todo: todo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

// post a todo

router.post("/", checkLogIn, async (req, res) => {
  try {
    const newTodo = new Todo({
      ...req.body,
      user: req.userId,
    });

    const todo = await newTodo.save();
    await User.updateOne(
      {
        _id: req.userId,
      },
      {
        $push: {
          todos: todo._id,
        },
      }
    );
    res.status(201).json({
      message: "Todo inserted successfully",
      todo: newTodo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

// post multiple todo's
router.post("/all", async (req, res) => {
  try {
    await Todo.insertMany(req.body);
    res.status(201).json({
      message: "Multiple Todos inserted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

// delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.deleteOne({ _id: req.params.id });

    if (!todo.deletedCount) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Successfully deleted a todo",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

// get all user

router.get("/all", async (req, res) => {
  try {
    const users = await User.find({
      status: "active",
    }).populate("todos");
    res.status(200).json({
      data: users,
      message: "successfully loaded user ",
    });
  } catch (error) {
    res.status(500).json({
      message: "server error ",
    });
  }
});

module.exports = router;
