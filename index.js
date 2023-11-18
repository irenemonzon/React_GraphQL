const {ApolloServer}=require('apollo-server');
const typeDefs= require('./db/schema')
const resolvers=require('./db/resolvers')
const conectarDB=require('./config/db');

//conectar a la BD
conectarDB()

//servidor
const server= new ApolloServer({
    typeDefs,
    resolvers,
    context:()=>{
        const UsuarioId=20

        return{
            UsuarioId
        }
    }
});

//arrancar el servidor
server.listen().then(({url})=>{
    console.log('servidor listo en la URL ${url}')
})