import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
})

const authLink = setContext((_, { headers }) => {
  // Read token fresh every single request
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('archiform_token')
    : null

  console.log('Apollo sending token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN')

  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log('Operation:', operation.operationName)
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) =>
      console.error('[GraphQL error]:', message))
  if (networkError)
    console.error('[Network error]:', networkError)
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query:      { fetchPolicy: 'network-only', errorPolicy: 'all' },
    mutate:     { errorPolicy: 'all' },
  },
})

export async function refetchAfterMutation() {
  await apolloClient.clearStore()
}