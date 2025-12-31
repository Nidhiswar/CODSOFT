const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "User no longer exists" });

        req.userRole = user.role;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

const admin = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};

module.exports = { auth, admin };
