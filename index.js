import { ApolloServer } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { startStandaloneServer } from '@apollo/server/standalone';

import {v1 as uuid} from 'uuid'

const persons = [
    {
        name: "Midu",
        phone: "034-1234567",
        street: "Calle Frontend",
        city: "Barcelona",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Youseff",
        phone: "044-123456",
        street: "Avenida Fullstack",
        city: "Mataro",
        id: '3d599470-3436-119-bc57-8b80ba54c431'
    },
    {
        name: "Itzi",
        street: "Pasaje Testing",
        city: "Ibiza",
        id: '3d599471-3436-11e9-bc57-8b80ba54c431'
        },
]

const typeDefs = `#graphql
  enum YesNo {
    YES
    NO
  }

    type Address {
        street: String!
        city: String!
    }
    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person
    }
`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
          if(!args.phone) return persons

          const byPhone = person => 
            args.phone === "YES" ? person.phone : !person.phone
          
          return persons.filter(byPhone)
          },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find( person => person.name === name)
        }
    },

    Mutation: {
      addPerson: (root, args) => {
        if(persons.find(p => p.name === args.name)) {
          throw new GraphQLError('Name must be unique', {
            extentions: {
              invalidArgs: args.name
            }
          })
        }
        const person = {...args, id: uuid()}
        persons.push(person)
        return person
      }
    },

    Person: {
        address: (root) => {
            return {
                city: root.city,
                street: root.street
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})



const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);