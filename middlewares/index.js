import jwt from "jsonwebtoken";

const requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } else {
    return res.status(401).json({
      status: 401,
      message: "Authorization required",
    });
  }
  next();
};
const userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      status: 403,
      message: "User access denied",
    });
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Admin access denied",
    });
  }
  next();
};

export { requireSignin, userMiddleware, adminMiddleware };
