'use strict'

var jwt = require('jwt-simple');

//cargar moment
var moment = require('moment');
var secret = 'clave_secreta_curso';

//el next es para salir del middleware
exports.ensureAuth = function (req, res, next){

    // recoger la autorizacion
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'la peticion no tiene la cabecera de autenticacion'
        });
    } 

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            res.status(401).send({
                message: 'Token ha expirado'
            });
        }
    }catch(ex){
        res.status(403).send({
            message: 'Token no es valido'
        });
    }
    req.user = payload;

    next();
};