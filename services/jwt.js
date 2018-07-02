'use strict'

var jwt = require('jwt-simple');

//cargar moment
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.createToken = function(user){

    //usuario a codificar dentro del token y lo guardara dentro de un hash y de esa forma comprobamos si un usuario esta logeado o no
    var payload = {
        sub: user._id, //para guardar el id
        name: user.name,
        surname: user.surname,
        email: user.name,
        role: user.role,
        imagen: user.imagen,
        iat: moment().unix(), //fecha de creacion del token, en formato timestand
        exp: moment().add(30, 'days').unix //fecha de expiracion
    };

    return jwt.encode(payload, secret);
};