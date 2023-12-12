const {ApolloServer}=require('apollo-server');
const typeDefs= require('./db/schema')
const resolvers=require('./db/resolvers')
const conectarDB=require('./config/db');
const jwt=require('jsonwebtoken');
require('dotenv').config({path:'variables.env'})

//conectar a la BD
conectarDB()

//servidor
const server= new ApolloServer({
    typeDefs,
    resolvers,
    context:({req})=>{
      
        const token=req.headers['authorization'] || ''
        if(token){
            try{
                const usuario=jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA)
              return{
                usuario
              }


            }catch(error){
                console.log('Hubo un error')
                console.log(error);
            }
        }
       
    }
});

//arrancar el servidor
server.listen().then(({url})=>{
    console.log('servidor listo en la URL ${url}')
})