const mongoose=require('mongoose');
require('dotenv').config({path:'variables.env'})

const conectarDB=async()=>{
    try{
        await mongoose.connect(process.env.DB_MONGO,{
      

        });
        console.log('DB Conectada')

    }catch(error){
        console.log('Hubo un error',error);
        process.exit(1); // detiene la app
    
    }
}
module.exports = conectarDB;
