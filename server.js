'use strict';

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const movieData = require('./data.json');
const exios = require('exios');
require('dotenv').config();
app.use(cors());
app.use(errorHandler);

// Define constructor function to ensure data follows same format
function Movie(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}

app.get('/', homeMov)
app.get('/favorite', favMov)
app.get('*', defaltHandler)
app.get('/trending', trending)

function homeMov(req, res) {
  // Create Movie object
  const movie = new Movie(
    movieData.title,
    movieData.poster_path,
    movieData.overview
  );
  res.send(movie);
}

// Define favorite page endpoint
function favMov(req, res) {
  res.send('Welcome to Favorite Page');
}
function defaltHandler(req, res) {
  res.status(404).send("defualt route");
}
function trending(req, res) {
  try {
    const APIKey = process.env.APIKey;
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIKey}&language=en-US`;
    axios.get(url)
      .then((result) => {
        //code depends on axios result

        let mapResult = result.data.recipes.map((item) => {
          let singleRecipe = new Movie(item.id, item.title, item.release_date,item.poster_path, item.overview);
          return singleRecipe;
        })
        res.send(mapResult);
      })
      .catch((err) => {
        console.log("sorry", err);
        res.status(500).send(err);
      })

    //code that does not depend on axios result
  
  }
  catch (error) {
    errorHandler(error, req, res);
  }
}

function errorHandler(erorr, req, res) {
  const err = {
      status: 500,
      massage: erorr
  }
  res.status(500).send(err);
}


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});