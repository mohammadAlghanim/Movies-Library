'use strict';

/*const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const movieData = require('./data.json');
const axios = require('axios');
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
});*/
const express = require('express');
const cors = require('cors');
const app = express();
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT;
const movieData = require('./data.json');
const axios = require('axios');

app.use(cors());
app.use(express.json());
const client = new pg.Client(process.env.DATABASE_URL);

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
app.get('/trending', trending)
app.get("/search", getSearch)
app.get('/genre', getGenre)
app.get("/getMovie", getMovies);
app.post("/getMovie",addMovies);
app.get("/getMovie/:id", getOneMovie);
app.put("/updateMovie/:id", updateMovie);
app.delete("/deleteMovie/:id", deleteMovie);
app.get("/person", getPerson);
app.get('*', defaltHandler)
app.use(errorHandler);

function homeMov(req, res) {
  // Create Movie object
  const movie = new Movie(
    movieData.id,
    movieData.title,
    movieData.release_date,
    movieData.poster_path,
    movieData.overview
  );
  res.send(movie);
}

// Define favorite page endpoint
function favMov(req, res) {
  res.send('Welcome to Favorite Page');
}

function trending(req, res) {
  try {
    const APIKey = process.env.APIKey;
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIKey}&language=en-US`;
    axios.get(url)
      .then((result) => {
        const movies = result.data.results.map((movie) => {
          // Create Movie object
          const newMovie = new Movie(
            movie.id,
            movie.title,
            movie.release_date,
            movie.poster_path,
            movie.overview
          );
          return newMovie;
        });
        res.send(movies);
      })
      .catch((error) => {
        console.log("Error fetching trending movies:", error.message);
        res.status(500).send({ error: "Sorry, an error occurred." });
      });
  } catch (error) {
    console.log("Error fetching trending movies:", error.message);
    res.status(500).send({ error: "Sorry, an error occurred." });
  }
}
const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKey}&language=en-US&query=The%20Hateful%20Eight&page=1`;

function getSearch(req, res) {
  try {
    axios
      .get(searchURL)
      .then((response) => {
        const newMoveis = response.data.results.map(
          (e) =>
            (e = new Movie(
              e.id,
              e.title,
              e.release_date,
              e.poster_path,
              e.overview,
              e.name
            ))
        );

        res.json(newMoveis);
      })
      .catch((e) => console.log(e.message));
  } catch (error) {
    errorHandler(error, req, res);
  }
}
const genreURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKey}&language=en`;


function getGenre(req, res) {
  try {
    axios
      .get(genreURL)
      .then((response) => {
        res.json(response.data);
      })
      .catch((e) => console.log(e.message));
  } catch (error) {
    errorHandler(error, req, res);
  }
}

function getMovies(req, res) {
  const sql = `SELECT * FROM movies`;
  client
    .query(sql)
    .then((data) => {
      res.send(data.rows);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
function addMovies(req,res){
  const movie = req.body;
  const sqlUrl = `INSERT INTO movies (title,release_date,poster_path,overview) VALUES ('${movie.title}','${movie.release_date}','${movie.poster_path}','${movie.overview}') RETURNING *;`;
  client
    .query(sqlUrl)
    .then((data) => {
      res.send(data.rows);
    })
    .catch((err) => console.log(err.message));
}

function getOneMovie(req, res) {
  const id = req.params.id;
  const sqlQuery = `SELECT * FROM movies WHERE id=${id};`;
  client
    .query(sqlQuery)
    .then((data) => res.send(data.rows))
    .catch((err) => errorHandler(err, req, res));
}
function updateMovie(req, res) {
  const id = req.params.id;
  const newData = req.body;
  const sqlQuery = `UPDATE movies SET title='${newData.title}', release_date='${newData.release_date}', poster_path='${newData.poster_path}',overview='${newData.overview}'  WHERE id=${id} RETURNING *;`;
  client
    .query(sqlQuery)
    .then((data) => res.status(200).json(data.rows))
    .catch((err) => errorHandler(err, req, res));
}

function deleteMovie(req, res) {
  const id = req.params.id;
  const sql = `DELETE FROM movies WHERE id=${id};`;
  client
    .query(sql)
    .then((data) => {
      res.status(204).json({});
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}

const personURL = `https://api.themoviedb.org/3/person/10859?api_key=${process.env.APIKey}&language=en`;

function getPerson(req, res) {
  try {
    axios
      .get(personURL)
      .then((response) => {
        res.json(
          new Movie(
            response.data.id,
            response.data.name,
            response.data.birthday,
            response.data.biography
          )
        );
      })
      .catch((e) => console.log(e.message));
  } catch (error) {
    errorHandler(error, req, res);
  }
}

function defaltHandler(req, res) {
  res.status(404).send("Not found.");
}

function errorHandler(error, req, res, next) {
  const err = {
    status: 500,
    message: error.message
  };
  res.status(500).send(err);
}
client.connect()
.then(()=>{
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
})
