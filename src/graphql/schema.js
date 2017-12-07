// Schema for sample GraphQL server.
import { makeExecutableSchema } from 'graphql-tools';
import Definitions from './definitions';
import Database from './database';
import Resolvers from './resolvers';
import * as settings from '../settings';

// returns Database object that has provides connectors to the database
const database = new Database(settings);
const { connectors } = database;

// Resolving functions that use the database connections to resolve GraphQL queries
const resolvers = Resolvers(connectors);

const schema = makeExecutableSchema({
  // GraphQL schema definitions
  typeDefs: Definitions,
  resolvers,
});

export default schema;
