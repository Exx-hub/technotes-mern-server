const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// route - POST /auth/
// access - Public
const login = async (req, res) => {
  const { username, password } = req.body;

  // validation BE side
  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password required." });
  }

  // check if user exists
  const userFound = await User.findOne({ username }).exec();
  // console.log(userFound);
  if (!userFound || !userFound.active) {
    return res.status(401).json({ message: "Unauthorized...." });
  }

  // compare input password against hashed password from DB
  const verifiedPassword = await bcrypt.compare(password, userFound.password);
  // console.log(verifiedPassword);

  if (!verifiedPassword) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  // from here passwords should match and user is authenticated.
  // create access token for user and login succeeded.

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: userFound.username,
        roles: userFound.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );

  const refreshToken = jwt.sign(
    { username: userFound.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // create secure cookie with refresh token and sent along with the response
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: "None", // // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry set to match refresh token expiry
  });

  // send accessToken containing username and roles
  res.json({ message: "Login success", accessToken });
};

// route - GET /auth/refresh
// access - Public - because token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  console.log("cookies:", cookies);

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      // decoded => stored user info in refresh token
      if (err) return res.status(403).json({ message: "Forbidden", error: err });

      // use username in the jwt to find user wanting to get refreshed access
      const userFound = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!userFound) return res.status(401).json({ message: "Unauthorized." });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: userFound.username,
            roles: userFound.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "5m" }
      );

      res.json({ message: "Refresh success", accessToken });
    })
  ;
};

// route - POST /auth/logout
// access - public - just to clear cookies if exists
const logout = (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) return res.sendStatus(204); // no content

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  res.json({ message: "Cookie cleared." });
};

module.exports = { login, logout, refresh };
