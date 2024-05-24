import Team from "../models/team.js";
import User from "../models/user.js";

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { teamName, description, users } = req.body;

    // Check if any user has the role 'admin'
    if (users && users.length > 0) {
      const adminUsers = await User.find({
        _id: { $in: users },
        role: "admin",
      });
      if (adminUsers.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Admin users cannot be added to a team",
        });
      }
    }

    // Check if any user already has a team
    if (users && users.length > 0) {
      const usersInTeam = await User.find({
        _id: { $in: users },
        haveTeam: true,
      });
      if (usersInTeam.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "One or more users are already in a team",
        });
      }
    }

    const newTeam = new Team({ teamName, description, users });
    const savedTeam = await newTeam.save();

    // Update haveTeam field for the users
    if (users && users.length > 0) {
      const updateResult = await User.updateMany(
        { _id: { $in: users } },
        { $set: { haveTeam: true } }
      );
    }

    return res.status(201).json({
      status: 201,
      payload: savedTeam,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 400,
        message: "Team name already exists",
      });
    }
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

const getTeams = async (req, res) => {
  try {
    let query = {};

    if (req.query.teamName) {
      query.teamName = { $regex: req.query.teamName, $options: "i" }; // Case-insensitive search
    }

    if (req.query.id) {
      query._id = req.query.id;
    }

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    const teams = await Team.find(query)
      .populate({
        path: "users",
        select: "username",
      })
      .skip(skip)
      .limit(size);

    const totalTeamCount = await Team.countDocuments(query);

    if (teams.length > 0) {
      return res.status(200).json({
        status: 200,
        totalTeamCount,
        totalPages: Math.ceil(totalTeamCount / size),
        currentPage: page,
        payload: teams,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No teams found",
      });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { teamName, description, users } = req.body;

    // Find the existing team to compare users before and after update
    const existingTeam = await Team.findById(teamId).populate("users");
    if (!existingTeam) {
      return res.status(404).json({
        status: 404,
        message: "Team not found",
      });
    }

    // Check if any user has the role 'admin'
    if (users && users.length > 0) {
      const adminUsers = await User.find({
        _id: { $in: users },
        role: "admin",
      });
      if (adminUsers.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Admin users cannot be added to a team",
        });
      }

      // Filter out users who are already part of this team
      const usersNotInCurrentTeam = users.filter(
        (userId) =>
          !existingTeam.users.some((user) => user._id.toString() === userId)
      );

      // Check if any of the remaining users already have a team
      const usersInTeam = await User.find({
        _id: { $in: usersNotInCurrentTeam },
        haveTeam: true,
      });
      if (usersInTeam.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "One or more users are already in a team",
        });
      }
    }

    // Update team details
    existingTeam.teamName = teamName || existingTeam.teamName;
    existingTeam.description = description || existingTeam.description;

    // Determine users to be added and removed
    const newUsers = users || [];
    const existingUserIds = existingTeam.users.map((user) =>
      user._id.toString()
    );
    const usersToAdd = newUsers.filter(
      (userId) => !existingUserIds.includes(userId)
    );
    const usersToRemove = existingUserIds.filter(
      (userId) => !newUsers.includes(userId)
    );

    // Update haveTeam field for users being added and removed
    if (usersToAdd.length > 0) {
      await User.updateMany(
        { _id: { $in: usersToAdd } },
        { $set: { haveTeam: true } }
      );
    }
    if (usersToRemove.length > 0) {
      await User.updateMany(
        { _id: { $in: usersToRemove } },
        { $set: { haveTeam: false } }
      );
    }

    // Save updated team with new users
    existingTeam.users = newUsers;
    const updatedTeam = await existingTeam.save();

    return res.status(200).json(updatedTeam);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    // Find the team and populate its users
    const team = await Team.findById(teamId).populate("users");
    if (!team) {
      return res.status(404).json({
        status: 404,
        message: "Team not found",
      });
    }

    // Get user IDs from the team
    const userIds = team.users.map((user) => user._id);

    // Delete the team
    await Team.findByIdAndDelete(teamId);

    // Update haveTeam field for all users in the deleted team
    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { haveTeam: false } }
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

const removeUserFromTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        status: 404,
        message: "Team not found",
      });
    }

    // Check if the user is part of the team
    const userIndex = team.users.indexOf(userId);
    if (userIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "User not found in the team",
      });
    }

    // Remove the user from the team's users array
    team.users.splice(userIndex, 1);
    await team.save();

    // Update the user's haveTeam field to false
    const user = await User.findById(userId);
    if (user) {
      user.haveTeam = false;
      await user.save();
    }

    return res.status(200).json({
      status: 200,
      message: "User removed from team successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Internal Server Error",
    });
  }
};

export { getTeams, createTeam, updateTeam, deleteTeam, removeUserFromTeam };
