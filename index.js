'use strict'

var mongoose = require('mongoose');
var app = require('./app');
require('./config/config'); //para configurar el puerto
// var port = process.env.PORT || 3977; // puerto para mi servidor

mongoose.Promise = global.Promise;
mongoose.connect(process.env.URLDB, {useNewUrlParser: true }, (err, res) => {
    if(err){
        throw err;
    }else{
        console.log("la conexion a la base de datos esta funcionando correctamente...");
        
        app.listen(PORT, function(){
            console.log("Servidor del api rest de musica escuchando en http://localhost: "+ PORT);
            
        });
    }
});