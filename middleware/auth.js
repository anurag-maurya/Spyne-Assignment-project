const jwt = require("jsonwebtoken");
const config = require("./../config");
const {userAllowed} = require('./../services/postService/postController')

exports.auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    jwt.verify(token, config.jwtsecret, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: `Token is not valid, error: ${err}` });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(401).json({ msg: `Token is not valid, error: ${err}` });
  }
};
