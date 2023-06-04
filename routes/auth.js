const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);


router.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, (err, userData) => {
      if (err) {
        return res.send({
          message: "Invalid token",
        });
      }
      const { id, username } = userData;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token found");
  }
});

router.post("/register", async (req, res) => {
  const {username, password} = req.body;

  try {
    const hashedPassowrd = bcrypt.hashSync(password, bcryptSalt)
    const createdUser = await Users.create({
      username:username,
      password:hashedPassowrd,
      });
    const token = jwt.sign(
      { userId: createdUser._id, username: createdUser.username },
      jwtSecret
    );
    // console.log(token)
    res
      .cookie("token", token, { sameSite: "none", secure: true })
      .status(201)
      .json({
        id: createdUser._id,
      });

    // res.status(200).send({ message: "Succesfully Registered" });
  } catch (e) {
    res.send({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
try{
  const foundUser = await Users.findOne({username});
  if(foundUser){
    const passOk = bcrypt.compareSync(password, foundUser.password)
    if(passOk){
      const token = jwt.sign(
        { userId: foundUser._id, username: foundUser.username },
        jwtSecret
      );
      // console.log(token)
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          id: foundUser._id,
        });
    }
  }
} catch (e) {
  res.send({ error: e.message });
}
  
})

router.post('/logout', async (req, res)=>{
  res.cookie('token', ',' , { sameSite: "none", secure: true }).json('ok');
})

module.exports = router;
