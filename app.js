const express = require('express');
const app = express();

const http = require("http");
const path = require('path');
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const locations = {};

io.on("connection", function(socket){
  console.log("User connected:", socket.id);

  for(const [id, loc] of Object.entries(locations)){
    socket.emit("receive-location", {id, ...loc});
  }
  socket.on("send-location", function (data) {
    locations[socket.id] = data;
    io.emit("receive-location", {id: socket.id, ...data});
  })
  socket.on("disconnect", function(){
    console.log("User disconnected", socket.id);
    delete locations[socket.id];
    io.emit("user-disconnected", socket.id)
  })
});

app.get("/", function(req, res){
  res.render("index");
})

require('dotenv').config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});