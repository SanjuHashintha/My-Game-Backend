import User from "../models/user.js";

const getUsers = async (req, res) => {
  try {
    let query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.id) {
      query._id = req.query.id;
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

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (updatedUser) {
      return res.status(200).json({
        status: 200,
        payload: updatedUser,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

export { getUsers, deleteUser, updateUser };
