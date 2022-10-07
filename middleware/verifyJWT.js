const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
 
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }

//   console.log("AUTH HEADER:", authHeader);
  const token = authHeader.split(" ")[1]; // authHeader.slice(7)
//   console.log("ACCESS TOKEN:", token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden..." });

    // console.log(decoded)
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;

    // use roles in req.roles to check if user has permission to a certain route.
    next();
  });
};

module.exports = verifyJWT;

// try {
//   const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   req.user = tokenData.UserInfo.username;
//   req.roles = tokenData.UserInfo.roles;
//   next()
// } catch (err) {
//   return res.status(403).json({ message: "Forbidden" });
// }
