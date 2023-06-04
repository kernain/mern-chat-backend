const express = require("express");
const Users = require("../models/Users");
const router = express.Router();



router.get("/users", async (req, res) => {
    const users = await Users.find({}, {"_id":1, "username":1})
    res.json(users);
});

module.exports = router;
    