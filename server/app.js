const express = require("express");
const graphqlHTTP = require('express-graphql')
const app = express();
const schema = require('../server/schema/schema.js')
const mongoose = require('mongoose')
const PORT = 3005;


mongoose.connect(`mongodb://stanislaw:kamenka@cluster0-shard-00-00-yzieo.mongodb.net:27017,cluster0-shard-00-01-yzieo.mongodb.net:27017,cluster0-shard-00-02-yzieo.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  dbName: "graphQL",
  useUnifiedTopology: true,
  useFindAndModify: false
})

const connection = mongoose.connection

connection.on('error',(error) => console.log(`you got error: ${error.message}`))
connection.once('open', function() {
  mongoose.connection.db.listCollections().toArray(function (err, names) {
    console.log(names); // [{ name: 'dbname.myCollection' }]
    module.exports.Collection = names;
});
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))


app.listen(PORT, err => {
  err ? console.log(error) : console.log(`server listening on port ${PORT}`);
});
