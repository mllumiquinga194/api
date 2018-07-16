'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar rutas 
var user_routes = require('./routes/user');
var artist_routes = require('./routes/artist');
var album_routes = require('./routes/album');
var song_routes = require('./routes/song');

//lo que hace es convertir a objetos JSON lo datos que llegan en las peticiones http
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//configurar cabeceras http y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// rutas base
//para tener especie de middleware para ponerle API delante de todas las rutas. antes de ejecutar el servidor, el fichero de ruta, antes qwue se realice cada peticion, por cada ruta va a tener un api delante..... voy a cargar el fichero de configuracion de rutas
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);
app.use('/api', song_routes);

//ruta de ejemplo
// app.get('/pruebas', function(req, res){
//     res.status(200).send({message: 'Bienvenido al curso'})
// });



module.exports = app;


