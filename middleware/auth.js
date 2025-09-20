const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: "No header found!" });
    }
    if (!authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Token should start with Bearer!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedUser = jwt.verify(token, process.env.JWT_KEY);
        req.user = decodedUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token!" });
    }
};

module.exports = authMiddleware;