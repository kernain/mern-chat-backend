const express = require("express");
const Messages = require("../models/Message");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;


router.get("/:userId", async (req, res) => {
    const {userId} = req.params;
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, userData) => {
        if (err) {
          return res.send({
            message: "Invalid token",
          });
        }
        const ourUserId = userData.userId;
        // console.log(ourUserId)
        // console.log(userId)
          const messages = await Messages.find({
              sender: {$in: [userId, ourUserId]},
              recipient: {$in: [userId, ourUserId]}
          }).sort({createdAt: 1})
          res.json(messages)
      });
    } else {
      res.status(401).json("no token found");
    }
});

module.exports = router;
    