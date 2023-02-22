'use strict';
/*
//import the express framework
const express = require('express');
//import cors
const cors = require('cors');

const server = express();

//server open for all clients requests
server.use(cors());

const PORT = 3001;

//Routes
//home route
server.get('/',(req,res)=>{
    res.send("Hello from the HOME route");
})

// http://localhost:3001/test
server.get('/test',(req,res)=>{
    let str = "Hello from the backend";
    console.log("Hiiiii");
    res.status(200).send(str);
})

//default route
server.get('*',(req,res)=>{
    res.status(404).send("defualt route");
})

// http://localhost:3000 => (Ip = localhost) (port = 3000)
server.listen(PORT, () =>{
    console.log(`listening on ${PORT} : I am ready`);
})*/
const express = require('express');
const app = express();
const port = 3000;

// Define constructor function to ensure data follows same format
function Movie(title, poster_path, overview) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
}

// Define home page endpoint
app.get('/', (req, res) => {
  // Load data from JSON file
  const movieData = require('./data.json');
  // Create Movie object
  const movie = new Movie(
    movieData.title,
    movieData.poster_path,
    movieData.overview
  );
  res.send(movie);
});

// Define favorite page endpoint
app.get('/favorite', (req, res) => {
  res.send('Welcome to Favorite Page');
});

// Handle 404 errors
app.use(function(req, res, next) {
  res.status(404).send('Page not found');
});

// Handle 500 errors
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    status: 500,
    responseText: 'Sorry, something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});