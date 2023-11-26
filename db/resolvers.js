const Usuario=require('../models/Usuarios')
const Producto=require('../models/Producto')
const Cliente=require('../models/Cliente')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
require('dotenv').config({path:'variables.env'})

const crearToken=(usuario,secreta,expiresIn)=>{
    console.log(usuario);

    const {id,email,nombre,apellido}=usuario

    return jwt.sign({id,email,nombre,apellido},secreta,{expiresIn})

}

//Resolvers
const resolvers={
    Query:{
        obtenerUsuario: async(_,{token })=>{

            const usuarioId=await jwt.verify(token, process.env.SECRETA)

            return usuarioId
        } ,
        obtenerProductos: async() =>{
            try{
                const productos=await Producto.find({})
                return productos

            }catch(error){
                console.log(error)
            }
        },
        obtenerProducto:async(_, {id})=>{
            //revisar si el producto existe o no

            const producto=await Producto.findById(id);
            if(!producto){
                throw new Error('Producto no encontrado');

            }
            return producto;

        },
        obtenerClientes:async() => {

            try{
                const clientes=await Cliente.find({})
                return clientes;

            }catch(error){
                console.log(error);

            }
        },
        obtenerClientesVendedor:async(_,{},ctx)=>{

            try{
                const clientes=await Cliente.find({vendedor: ctx.usuario.id.toString(),})
                return clientes;

            }catch(error){
                console.log(error);

            }

        },
        obtenerCliente:async(_,{id},ctx)=>{
            //Revisar si el cliente existe o no
            const cliente=await Cliente.findById(id);
            if(!cliente){
                throw new Error('Cliente no encontrado');
            }
            //quien lo creo puede verlo
            if(cliente.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            return cliente
        }
    },
    Mutation:{
        nuevoUsuario:async(_,{input})=>{
            const {email,password}=input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario=await Usuario.findOne({email});
            console.log(existeUsuario)
            if(existeUsuario){
                throw new Error('El usuario ya esta registrado')
            }

            //Hashear su password
            const salt = await  bcrypt.genSalt(10);
            input.password=await  bcrypt.hash(password,salt);

            //Guardarlo  en la base de datos
            try{
                const usuario=new Usuario(input);
                usuario.save();
                return usuario;

            }catch(error){
                console.log(error)
            }
        },
        autenticarUsuario:async(_,{input})=>{
            const {email,password}=input 
            //si el usuario existe 
            const existeUsuario=await Usuario.findOne({email});
            if(!existeUsuario){
                throw new Error('El usuario no existe')
            }
            //revisar si el password es correcto
    
            const passwordCorrecto=await bcrypt.compare(password,existeUsuario.password);
            if(!passwordCorrecto){
                throw new Error('El password es incorrecto');
            }
    
            //Crear el token
            return {
                token:crearToken(existeUsuario, process.env.SECRETA,'24h' )
            }
    
        },
        nuevoProducto: async(_,{input})=>{

            try{
                const producto=new Producto(input)

                //almacenar en la BD
                const resultado=await producto.save()
                return resultado

            }catch(error){

            console.log(error)

            }
        } ,
        actualizarProducto:async(_,{id,input})=>{

            let producto=await Producto.findById(id);
            if(!producto){
                throw new Error('Producto no encontrado');

            }
            //guardarlo en la BD
            producto=await Producto.findOneAndUpdate({_id:id},input,{new:true} );

            return producto;
        },
        eliminarProducto:async(_,{id})=>{

            let producto=await Producto.findById(id);
            if(!producto){
                throw new Error('Producto no encontrado');

            }
            //Eliminar 
            await Producto.findOneAndDelete({_id:id})
            return "Producto eliminado"
        },

        nuevoCliente:async(_,{input},ctx)=>{
            const {email}=input
            //verificar si el cliente esta registrado
           const cliente= await Cliente.findOne({email})
           if(cliente){
            throw new Error('Cliente ya esta registrado');
           }
           const nuevoCliente= new Cliente(input);

            //asignar el vendedor
            nuevoCliente.vendedor=ctx.usuario.id;

            //guardar en BD
            try{
                const resultado= await nuevoCliente.save();
                return resultado;

            }catch(error){
                console.log(error);
            }
        },
        actualizarCliente:async(_,{id,input},ctx)=>{
            //verificar si existe o no

            let cliente= await Cliente.findById(id)
            if(!cliente){
                throw new Error('El cliente no existe');
               }


            //Verificar si el vendedor es quien edita 
            if(cliente.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }

            //guardar el cliente 
            cliente=await Cliente.findOneAndUpdate({_id:id},input,{new:true})
            return cliente;
        },
        eliminarCliente:async(_,{id},ctx)=>{
            let cliente= await Cliente.findById(id)
            if(!cliente){
                throw new Error('El cliente no existe');
               }


            //Verificar si el vendedor es quien edita 
            if(cliente.vendedor.toString()!==ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }

            //eliminar el cliente 
            await Cliente.findOneAndDelete({_id:id});
            return "Cliente Eliminado"
          

        }
      
        
    }
  
}
module.exports= resolvers;