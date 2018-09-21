'use strict'

var fs = require('fs'); //importamos el modulo de File System SISTEMAS DE FICHERO
var path = require('path'); // nos permite acceder a rutas completas
//Modulo de paginacion}
var mongoosePaginate = require('mongoose-pagination');

// importar el modelo
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({
        path: 'artist' //aqui se van a cargar los datos del objeto asociado a la propiedad 'artist'. como tenemos un objeto guardado dentro de artista, utilizando populate, nos va a cargar un objeto completo del tipo artista. de esta forma logramos obtener todos los artistas que han creado un album cuyo ID es el que ya tenemos guardado
    }).exec((err, album) =>{
        if(err){
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!album){
                return res.status(404).send({
                    message: 'El album no existe'
                });
            }else{
                return res.status(200).send({
                    album
                });
            }
        }
    });
}

function saveAlbum(req, res) {
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'noneAlbum.png';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!albumStored){
                return res.status(404).send({
                    message: 'No se ha guardado album'
                });
            }else{
                return res.status(200).send({
                    album: albumStored
                });
            }
        }
    });
}

function getAlbums(req, res) {
    var artistId = req.params.artist;

    if(!artistId){
        //sacar todos los album de la base de datos
        var find = Album.find({}).sort('title');
    }else{
        //sacar los albums de un artista concreto de la base de datos
        var find = Album.find({
            artist: artistId
        }).sort('year');
    }

    find.populate({
        path: 'artist'
    }).exec((err, albums) => {
        if(err){
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!albums){
                return res.status(404).send({
                    message: 'No hay album...'
                });
            }else{
                return res.status(200).send({
                    albums
                });
            }
        }
    });
}

function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!albumUpdated){
                return res.status(404).send({
                    message: 'No se ha actulizado el album...'
                });
            }else{
                return res.status(200).send({
                    album: albumUpdated
                });
            }
        }
    });
}

function deleteAlbum(req, res) {
    var albumId = req.params.id;
// si todo va bien, ahora borro de album, todo lo referente a ese artista.
    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if(err){
            return res.status(500).send({
                message: 'Error al Borrar el album'
            });
        }else{
            if(!albumRemoved){
                return res.status(404).send({
                    message: 'El album no ha sido eliminado'
                });
            }else{
                Song.find({ //si todo va bien, borro del documento Song, toda informacion del albun del artista
                    album: albumRemoved._id
                }).remove((err, songRemoved) => {
                    if(err){
                        return res.status(500).send({
                            message: 'Error al Borrar la concion'
                        });
                    }else{
                        if(!songRemoved){
                            return res.status(404).send({
                                message: 'la cancion no ha sido eliminada'
                            });
                        }else{
                            return res.status(200).send({ //si va todo bien, devuelvo el artista removido
                                album: albumRemoved
                            });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res) {
    
    //en el middleware que cree es que toma la imagen y la guarda en la carpeta asignada
    var albumId = req.params.id; //recibimos el Id de la ULR
    var file_name = 'No subido...';
    
    if(req.files){//tomo los archivos que vienen del body
        var file_path = req.files.image.path; // aqui ya tengo el path de la imagen, ahora recorto ese path para tener solo el nombre

        var file_split = file_path.split('\/'); //le recorto las barras a ese path y en file_name guardo el arreglo que me queda.
        var file_name = file_split[2];

        //si quisiera guardar la extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_name);
        console.log(file_ext);
        

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'PNG' || file_ext == 'JPG' || file_ext == 'GIF' || file_ext == 'JPEG' || file_ext == 'jpeg'){
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(err){
                    return res.status(500).send({ //error 500 porque es error de servidor
                        message: 'Error al actualizar imagen del album'
                    });
                }else{
                    if(!albumUpdated){
                        return res.status(404).send({
                            message: 'No se ha podido actualizar el album'
                        });
                    }else {
                        if (albumUpdated.image != 'noneAlbum.png') {

                            let imageOld = albumUpdated.image;
                            var path_file = './uploads/albums/' + imageOld;


                            fs.exists(path_file, function (exists) {
                                if (exists) {
                                    fs.unlink(path_file, (ready) => {
                                        if (ready) {
                                            return res.status(200).send({
                                                album: albumUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                                            });
                                        }
                                    });
                                } else {
                                    console.error('no existe ');
                                }
                            });
                            return res.status(200).send({
                                album: albumUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                            });
                        }
                        return res.status(200).send({
                            album: albumUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
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
            message: 'No ha subido ninguna imagen'
        });
    }

}

function getImageFile(req, res) {

    var imageFile = req.params.imageFile; //recogo el parametro que me va a llegar por url. que sera el nombre del fichero que yo quiero sacar por la base de datos

    if (!imageFile) {
        imageFile = 'noneAlbum.png';
    }
    
    var path_file = './uploads/albums/' + imageFile; //elegimos esta ruta porque el middleware necesita empezar desde la raiz del proyecto

    fs.exists(path_file, function (exists) {
        if (exists) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(200).send({
                message: 'No existe la imagen...'
            });
        }
    });


}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}