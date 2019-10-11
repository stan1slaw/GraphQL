const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLNonNull
} = require("graphql");

const Movies = require("../models/movie");
const Directors = require("../models/director");

const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    genre: { type: new GraphQLNonNull(GraphQLString) },
    rate: { type: GraphQLInt},
    watched: { type: new GraphQLNonNull(GraphQLBoolean) },
    director: {
      type: DirectorType,
      resolve({directorId}, args) {
        // return Directors.all, where Id = Parent(Movie.directorId)
        return Directors.findById(directorId);
      }
    }
  })
});

const DirectorType = new GraphQLObjectType({
  name: "Director",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString)  },
    age: { type:  new GraphQLNonNull(GraphQLInt)},
    movies: {
      type: new GraphQLList(MovieType),
      resolve({id}, args) {
        // return Movies.all, where Movies.directorId = Parent(Director.id)
        return Movies.find({ directorId: id });
      }
    }
  })
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addDirector: {
      type: DirectorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString)  },
        age: { type: new GraphQLNonNull(GraphQLInt)  }
      },
      resolve(parent, {name, age}) {
        const director = new Directors({
          name,
          age
        });
        return director.save();
      }
    },
    addMovie: {
      type: MovieType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString)},
        rate: { type: GraphQLInt},
        watched: { type: new GraphQLNonNull(GraphQLBoolean) },
        directorId: { type: GraphQLID }
      },
      resolve(parent, {name, genre, directorId, watched, rate}) {
        const movie = new Movies({
          name,
          genre,
          directorId,
          watched,
          rate
        });
        return movie.save();
      }
    },
    deleteMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, {id}) {
        return Movies.findByIdAndRemove(id);
      }
    },
    deleteDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, {id}) {
        return Directors.findByIdAndRemove(id);
      }
    },
    updateDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, {id, name, age}) {
        return Directors.findByIdAndUpdate(
          id,
          {
            $set: {
              name,
              age
            }
          },
          { new: true }
        );
      }
    },
    updateMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString)},
        rate: { type: GraphQLInt},
        watched: { type: new GraphQLNonNull(GraphQLBoolean) },
        genre: { type: new GraphQLNonNull(GraphQLString)},
        directorId: { type: GraphQLID }
      },
       resolve(parents, {id, name, genre, directorId, watched, rate}) {
        return Movies.findByIdAndUpdate(
          id, {
            $set: {
              name, 
              genre,
              directorId,
              rate, 
              watched
            }
          },
          {new: true}
        )
      }
    }
  }
});

const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      resolve(parent, {id}) {
        // return movies.find(movie => movie.id === args.id);
        return Movies.findById(id);
      }
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, {id}) {
        //  return directors.find(director => director.id === args.id)
        return Directors.findById(id);
      }
    },
    movies: {
      type: new GraphQLList(MovieType),
      resolve() {
        return Movies.find({});
      }
    },
    directors: {
      type: new GraphQLList(DirectorType),
      resolve() {
        return Directors.find({});
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
