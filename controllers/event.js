import Event from "../models/event.js";
import Team from "../models/team.js";

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { eventName, description, teams } = req.body;

    // Check for duplicate event name
    const existingEvent = await Event.findOne({ eventName });
    if (existingEvent) {
      return res.status(400).json({ error: "Event name already exists" });
    }

    // Check for duplicate team IDs
    if (teams && teams.length > 0) {
      const uniqueTeams = new Set(teams);
      if (uniqueTeams.size !== teams.length) {
        return res.status(400).json({ error: "Duplicate team IDs provided" });
      }

      // Validate team IDs
      const validTeams = await Team.find({ _id: { $in: teams } });
      if (validTeams.length !== teams.length) {
        return res.status(400).json({ error: "Invalid team IDs provided" });
      }
    }

    const newEvent = new Event({ eventName, description, teams });
    const savedEvent = await newEvent.save();
    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single event by ID
const getEvent = async (req, res) => {
  try {
    let query = {};

    if (req.query.eventName) {
      query.eventName = { $regex: req.query.eventName, $options: "i" }; // Case-insensitive search
    }

    if (req.query.id) {
      query._id = req.query.id;
    }

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    const events = await Event.find(query)
      .populate({
        path: "teams",
        populate: {
          path: "users",
          select: "username",
        },
      })
      .skip(skip)
      .limit(size);

    const eventCount = await Event.countDocuments(query);

    if (events.length > 0) {
      return res.status(200).json({
        status: 200,
        eventCount,
        totalPages: Math.ceil(eventCount / size),
        currentPage: page,
        payload: events,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No events found",
      });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Validate team IDs
    if (updateData.teams && updateData.teams.length > 0) {
      const validTeams = await Team.find({ _id: { $in: updateData.teams } });
      if (validTeams.length !== updateData.teams.length) {
        return res.status(400).json({ error: "Invalid team IDs provided" });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    }).populate("teams");
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createEvent, getEvent, updateEvent, deleteEvent };
