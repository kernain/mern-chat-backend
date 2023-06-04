const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const ws = require("ws");
const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const fs = require("fs")
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

const db = require("./config/db");
const Messages = require("./models/Message");

db.connection
  .once("open", () => console.log("connected to db"))
  .on("error", (err) => console.log("error connecting db -->", err));

app.use(express.json());
app.use(cookieParser());
app.use("/", require("./routes/index.js"));

const server = app.listen(process.env.PORT || 4000);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
            online: true
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });


  const cookies = req.headers.cookie; 
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    const token = tokenCookieString.split("=")[1];
    if (token) {
      jwt.verify(token, jwtSecret, (err, userData) => {
        if (err) throw err;
        const { userId, username } = userData;
        //   console.log(userData);
        connection.userId = userId;
        connection.username = username;
      });
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    
    if (recipient && text) {
      const messageDoc = await Messages.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
      .filter((c) => c.userId === recipient)
      .forEach(c => c.send(JSON.stringify({messageId: messageDoc._id,text, sender: connection.userId, recipient})))
    }
  });

  notifyAboutOnlinePeople()
});

// 2z7HgnVMBqvc3gKU
