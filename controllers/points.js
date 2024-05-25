import Event from "../models/event.js";
import Point from "../models/points.js";
import Team from "../models/team.js";
import User from "../models/user.js";

const addPoints = async (req, res) => {
  try {
    const { user, event, team, points } = req.body;
    // Validate user ID
    const getUser = await User.findById(user);
    if (!getUser) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate event ID
    const getEvent = await Event.findById(event);
    if (!getEvent) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // Validate team ID
    const getTeam = await Team.findById(team);
    if (!getTeam) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    // Check if points is a positive number
    if (typeof points !== "number" || points < 0) {
      return res
        .status(400)
        .json({ error: "Points must be a positive number" });
    }

    const newPoint = new Point({
      user: user,
      event: event,
      team: team,
      points,
    });
    const savedPoint = await newPoint.save();

    return res.status(201).json(savedPoint);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPoints = async (req, res) => {
  try {
    let query = {};

    if (req.query.event) {
      query.event = req.query.event;
    }

    if (req.query.team) {
      query.team = req.query.team;
    }

    if (req.query.user) {
      query.user = req.query.user;
    }

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    const points = await Point.find(query)
      .populate("user", "username")
      .populate("event", "eventName")
      .populate("team", "teamName")
      .skip(skip)
      .limit(size);

    const pointCount = await Point.countDocuments(query);

    if (points.length > 0) {
      return res.status(200).json({
        status: 200,
        pointCount,
        totalPages: Math.ceil(pointCount / size),
        currentPage: page,
        payload: points,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No points found",
      });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const updatePoints = async (req, res) => {
  try {
    const { user, event, team, points } = req.body;

    // Validate user ID
    const getUser = await User.findById(user);
    if (!getUser) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate event ID
    const getEvent = await Event.findById(event);
    if (!getEvent) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // Validate team ID
    const getTeam = await Team.findById(team);
    if (!getTeam) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    // Check if points is a positive number
    if (typeof points !== "number" || points < 0) {
      return res
        .status(400)
        .json({ error: "Points must be a positive number" });
    }

    // Update points
    const updatedPoint = await Point.findOneAndUpdate(
      { user, event, team },
      { points },
      { new: true, runValidators: true }
    );

    if (!updatedPoint) {
      return res.status(404).json({ error: "Points record not found" });
    }

    return res.status(200).json(updatedPoint);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { addPoints, getPoints, updatePoints };
