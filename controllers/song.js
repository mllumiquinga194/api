'use strict'

var fs = require('fs'); //importamos el modulo de File System SISTEMAS DE FICHERO
var path = require('path'); // nos permite acceder a rutas completas
//Modulo de paginacion}
var mongoosePaginate = require('mongoose-pagination');

// importar el modelo
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;

    Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
        if(err){
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!song){
                return res.status(404).send({
                    message: 'La cancion no existe!!'
                });
            }else{
                return res.status(200).send({
                    song
                });
            }
        }
    });
}

function getSongs(req, res) {
    var albumId = req.params.album;

    // si envio el ID del album, muestro todas las canciones de ese album, sino, muestro todas las canciones existentes en la base de datos.

    if(!albumId){
        var find = Song.find({}).sort('number');//Especifica el orden en el que la consulta devuelve documentos coincidentes. Debe aplicar sort () al cursor antes de recuperar cualquier documento de la base de datos.
    }else{
        var find = Song.find({album: albumId}).sort('number');
    }

    // todos los albumId se van a sustituir por los valores asosiados a ese ID la cual es album.
    find.populate({
        path: 'album', //si dentro del album quiero popular la informacion que esta ahi y quiero sacar tambien los artistas que tienen asociados ese album, entonces populo
        populate: {
            path: 'artist', //en artist yo tengo un objetId que esta en la coleccion de documentos Artist entonces yo queiro que eso me lo sustitulo por el objeto que hay en la coleccion de artista
            model: 'Artist'
        }
    }).exec(function(err, songs) {
        if(err){
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!songs){
                return res.status(404).send({
                    message: 'No hay Canciones'
                });
            }else{
                return res.status(200).send({
                    songs
                });
            }
        }
    });
}

function saveSong(req, res) {
    var song = new Song();

    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!songStored){
                return res.status(404).send({
                    message: 'No se ha guardado la cancion'
                });
            }else{
                return res.status(200).send({
                    song: songStored
                });
            }
        }
    });
}

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!songUpdated){
                return res.status(404).send({
                    message: 'No se ha actualizado la cancion'
                });
            }else{
                return res.status(200).send({
                    song: songUpdated
                });
            }
        }
    });
}

function deleteSong(req, res) {
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!songRemoved){
                return res.status(404).send({
                    message: 'No se ha borrado la cancion'
                });
            }else{
                return res.status(200).send({
                    song: songRemoved
                });
            }
        }
    });
}

function uploadFile(req, res) {
    
    //en el middleware que cree es que toma la imagen y la guarda en la carpeta asignada
    var songId = req.params.id; //recibimos el Id de la ULR
    var file_name = 'No subido...';
    
    if(req.files){//tomo los archivos que vienen del body
        var file_path = req.files.file.path; // aqui ya tengo el path de la imagen, ahora recorto ese path para tener solo el nombre

        var file_split = file_path.split('\\'); //le recorto las barras a ese path y en file_name guardo el arreglo que me queda.
        var file_name = file_split[2];

        //si quisiera guardar la extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_name);
        console.log(file_ext);
        

        if(file_ext == 'mp3' ||  file_ext == 'MP3' ||  file_ext == 'ogg' ||  file_ext == 'OGG'){
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(err){
                    return res.status(500).send({ //error 500 porque es error de servidor
                        message: 'Error al actualizar el archivo de audio'
                    });
                }else{
                    if(!songUpdated){
                        return res.status(404).send({
                            message: 'No se ha podido actualizar la cancion'
                        });
                    }else{
                        return res.status(200).send({
                            song: songUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                        });
                    }
                }
            });
        }else{
            return res.status(200).send({
                message: 'Ext del archivo no valida'
            });
        }
    }else{
        return res.status(200).send({
            message: 'No ha subido el fichero de audio...'
        });
    }

}

function getSongFile(req, res) {
    
    var imageFile = req.params.songFile; //recogo el parametro que me va a llegar por url. que sera el nombre del fichero que yo quiero sacar por la base de datos
    var path_file = './uploads/songs/'+imageFile; //elegimos esta ruta porque el middleware necesita empezar desde la raiz del proyecto

    fs.exists(path_file, function(exists){
        if(exists){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(200).send({
                message: 'No existe el fichero de audio...'
            });
        }
    });
}

module.exports = {
    getSong,
    getSongs,
    saveSong,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};
