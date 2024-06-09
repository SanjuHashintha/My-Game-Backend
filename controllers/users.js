import User from "../models/user.js";
import bcrypt from "bcryptjs";

const getUsers = async (req, res) => {
  try {
    let query = {};

    if (req.query.username) {
      query.username = { $regex: req.query.username, $options: "i" };
    }

    if (req.query.firstName) {
      query.firstName = { $regex: req.query.firstName, $options: "i" };
    }

    if (req.query.lastName) {
      query.lastName = { $regex: req.query.lastName, $options: "i" };
    }

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.id) {
      query._id = req.query.id;
    }

    if (req.query.haveTeam) {
      query.haveTeam = req.query.haveTeam;
    }

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    const users = await User.find(query).skip(skip).limit(size);
    const totalUsers = await User.countDocuments(query);

    if (users.length > 0) {
      return res.status(200).json({
        status: 200,
        totalUsers,
        totalPages: Math.ceil(totalUsers / size),
        currentPage: page,
        payload: users,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No users found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 500,
      error: "Internal Server Error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.query.id) {
      const result = await User.findByIdAndDelete(req.query.id);
      if (result) {
        return res.status(200).json({
          status: 200,
          message: "User deleted successfully",
          result,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
    } else {
      const result = await User.deleteMany({});
      return res.status(200).json({
        status: 200,
        message: `All users deleted, ${result.deletedCount} users were removed`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Validate that the email belongs to the user with the given ID
    if (updateData.email && updateData.email !== user.email) {
      return res.status(400).json({
        status: 400,
        message: "Email does not match the user ID",
      });
    }

    // Check if the password is being updated
    if (updateData.password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateData.password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status: 200,
      payload: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

export { getUsers, deleteUser, updateUser };
