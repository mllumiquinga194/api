'use strict'

var fs = require('fs'); //importamos el modulo de File System SISTEMAS DE FICHERO
var path = require('path'); // nos permite acceder a rutas completas
//Modulo de paginacion}
var mongoosePaginate = require('mongoose-pagination');

// importar el modelo
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!artist) {
                return res.status(404).send({
                    message: 'El artista no existe'
                });
            } else {
                return res.status(200).send({
                    artist
                });
            }
        }
    });
}

function getArtists(req, res) {
    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = 4;

    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!artists) {
                return res.status(404).send({
                    message: 'No hay Artistas...'
                });
            } else {
                //console.log( artist );
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
        }
    });
}

function saveArtists(req, res) {
    var artist = new Artist();
    var params = req.body;

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'noneArtist.png'; //al guardar un artista, le asigno la imagen por defecto que ya se encuentra guardada en la carpeta de upload

    artist.save((err, artistStored) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al guardar el artista'
            });
        } else {
            if (!artistStored) {
                return res.status(404).send({
                    message: 'Ela artista no ha sido guardado'
                });
            } else {
                return res.status(200).send({
                    artist: artistStored
                });
            }
        }
    });
}
function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al guardar el artista'
            });
        } else {
            if (!artistUpdated) {
                return res.status(404).send({
                    message: 'El artista no ha sido actualizado'
                });
            } else {
                return res.status(200).send({
                    artist: artistUpdated
                });
            }
        }
    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => { //borro el documento artista con id artistId
        if (err) {
            return res.status(500).send({
                message: 'Error al Borrar el artista'
            });
        } else {
            if (!artistRemoved) {
                return res.status(404).send({
                    message: 'El artista no ha sido eliminado'
                });
            } else {
                Album.find({ // si todo va bien, ahora borro de album, todo lo referente a ese artista.
                    artist: artistRemoved._id
                }).remove((err, albumRemoved) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Error al Borrar el album'
                        });
                    } else {
                        if (!albumRemoved) {
                            return res.status(404).send({
                                message: 'El album no ha sido eliminado'
                            });
                        } else {
                            Song.find({ //si todo va bien, borro del documento Song, toda informacion del albun del artista
                                album: albumRemoved._id
                            }).remove((err, songRemoved) => {
                                if (err) {
                                    return res.status(500).send({
                                        message: 'Error al Borrar la concion'
                                    });
                                } else {
                                    if (!songRemoved) {
                                        return res.status(404).send({
                                            message: 'la cancion no ha sido eliminada'
                                        });
                                    } else {
                                        return res.status(200).send({ //si va todo bien, devuelvo el artista removido
                                            artist: artistRemoved
                                        });
                                    }
                                }
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
    var artistId = req.params.id; //recibimos el Id de la ULR
    var file_name = 'No subido...';

    if (req.files) {//tomo los archivos que vienen del body
        var file_path = req.files.image.path; // aqui ya tengo el path de la imagen, ahora recorto ese path para tener solo el nombre

        var file_split = file_path.split('\\'); //le recorto las barras a ese path y en file name guardo el arreglo que me queda.
        var file_name = file_split[2];

        //si quisiera guardar la extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // console.log(file_name);
        // console.log(file_ext);


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'PNG' || file_ext == 'JPG' || file_ext == 'GIF' || file_ext == 'JPEG' || file_ext == 'jpeg') {
            Artist.findByIdAndUpdate(artistId, { image: file_name }, (err, artistUpdated) => {
                if (err) {
                    return res.status(500).send({ //error 500 porque es error de servidor
                        message: 'Error al actualizar imagen del usuario'
                    });
                } else {
                    if (!artistUpdated) {
                        return res.status(404).send({
                            message: 'No se ha podido actualizar el usuario'
                        });
                    } else {
                        //una vez que ya se verifico que la imagen a subir es valida procedo a borrar la imagen que tenia anteriormente
                        if (artistUpdated.image != 'noneArtist.png') {// siempre y cuando sea diferente a la imagen por defecto, para que esta no sea borrada

                            let imageOld = artistUpdated.image; //tomo la imagen para formar mi path
                            var path_file = './uploads/artists/' + imageOld;


                            fs.exists(path_file, function (exists) {
                                if (exists) { //si la imagen existe
                                    fs.unlink(path_file, (ready) => {//la borro
                                        if (ready) {
                                            return res.status(200).send({
                                                artist: artistUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                                            });
                                        }
                                    });
                                } else {
                                    console.error('no existe ');//si no existe ignoro el error y mando este mensaje por consola
                                }
                            });
                            return res.status(200).send({
                                artist: artistUpdated // si la imagen no existe, igual actualizo con la imagen nueva
                            });
                        }
                        return res.status(200).send({
                            artist: artistUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                            //si la iamgen es igual a 'noneArtist.png' no la borro, sino que cargo una nueva y de esta forma mantengo en el servidor la imagen por defecto para que otros nuevos artistas la puedan usar si no agregan imagenes.
                        });
                    }
                }
            });
        } else {
            return res.status(200).send({
                message: 'Ext del archivo no valida'
            });
        }

    } else {
        return res.status(200).send({
            message: 'No ha subido ninguna imagen'
        });
    }

}

function getImageFile(req, res) {

    var imageFile = req.params.imageFile; //recogo el parametro que me va a llegar por url. que sera el nombre del fichero que yo quiero sacar por la base de datos
    //ahora el imageFile es opcional, en dado caso que no venga, se le asigna la imagen por defecto.
    if (!imageFile) {
        imageFile = 'noneArtist.png'; //se le asigna la imagen por defecto. en el archivo de rutas ya le dije que la imagen es opcional, en dado caso que no llegue, me mandara la imagen por defecto
    }

    var path_file = './uploads/artists/' + imageFile; //elegimos esta ruta porque el middleware necesita empezar desde la raiz del proyecto

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
    getArtist,
    saveArtists,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}