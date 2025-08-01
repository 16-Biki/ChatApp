const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "Email already exists" });

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ msg: "Signup successful" });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate user
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        res.json({ msg: "Login successful", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});

router.get("/all", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
