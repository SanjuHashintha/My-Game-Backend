import User from "../../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  const existing_user_email = await User.findOne({ email: req.body.email });
  const existing_username = await User.findOne({ username: req.body.username });
  if (existing_user_email)
    return res.status(400).json({
      status: 400,
      message: "Email already exist",
    });
  if (existing_username)
    return res.status(400).json({
      status: 400,
      message: `Username '${req.body.username}' already exists`,
    });

  const salt = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hash_password,
    role: "admin",
  });

  try {
    const savedUser = await user.save();
    return res.status(201).json({
      status: 201,
      message: "Admin Created Successfully",
      payload: savedUser,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const signin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(404).json({
      status: 404,
      message: "Email is not found",
    });

  const validatedPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (validatedPassword && user.role === "admin") {
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "365d",
      }
    );
    const { _id, username, email, role } = user;
    res.status(200).json({
      status: 200,
      payload: {
        token: token,
        _id,
        username,
        email,
        role,
      },
    });
  } else {
    return res.status(400).send("Password is wrong");
  }
};

export { signup, signin };
