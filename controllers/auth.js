import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  const existing_user = await User.findOne({ email: req.body.email });
  if (existing_user)
    return res.status(400).json({
      status: 400,
      message: "Email already exist",
    });

  const salt = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hash_password,
  });

  try {
    const savedUser = await user.save();
    return res.status(201).json({
      status: 200,
      message: "User Created Successfully",
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
      mwssage: "Email is not found",
    });

  const validatedPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (validatedPassword) {
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
