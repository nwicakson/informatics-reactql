// Schema for sample GraphQL server.
import { makeExecutableSchema } from 'graphql-tools';
import Definitions from './definitions';
import Database from './database';
import Resolvers from './resolvers';
import * as settings from './settings/settings';

// returns Database object that has provides connectors to the database
const DB = new Database(settings);
const Connectors = DB.connectors;

// Resolving functions that use the database connections to resolve GraphQL queries
const R = Resolvers(Connectors, settings.publicSettings);

const schema = makeExecutableSchema({
  // GraphQL schema definitions
  typeDefs: Definitions,
  resolvers: R,
});

export default schema;
