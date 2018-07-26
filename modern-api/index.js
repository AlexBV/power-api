const hapi = require('hapi');
const mongoose = require('mongoose');
const Painting = require('./models/Painting');
const { graphqlHapi, graphiqlHapi} = require('apollo-server-hapi');
const schema = require('./graphql/schema');
const Inert = require('inert');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const Vision = require('vision');

mongoose.connect('mongodb://admin:passw0rd@ds145121.mlab.com:45121/powerfull-api');
mongoose.connection.once('open', () => {
    console.log('connected to database');
})

const server = new hapi.server({ 
    port:4000,
    host:'localhost'
});

const init = async () => {
    await server.register({
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            route:{
                cors: true
            }
        }
    });

    await server.register({
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema
            },
            route:{
                cors: true
            }
        }
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: "Painting API",
                    version: Pack.version
                }
            }
        }
    ]);

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: function(request, reply) {
                return `<h1>My modern api</h1>`;
            }
        },
        {
            method: 'GET',
            path: '/api/v1/paintings',
            config : {
                description: 'Get all the paintings',
                tags: ['api', 'v1', 'paintings']
            },
            handler: function(request, reply) {
                return Painting.find();
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            config : {
                description: 'Get a specific painting by ID',
                tags: ['api', 'v1', 'paintings']
            },
            handler: function(request, reply) {
                const {name, url, techniques } = request.payload;
                const painting = new Painting({
                    name,
                    url,
                    techniques
                })
                return painting.save();
            }
        }
    ]);

    await server.start();
    console.log(`server run at : ${server.info.uri}`);
};

init();