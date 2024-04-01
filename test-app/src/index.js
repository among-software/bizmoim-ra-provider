const { ApolloClient, InMemoryCache, gql } = require("@apollo/client/core");
const { createFragmentRegistry } = require("@apollo/client/cache");
const biz = require("bizmoim-ra-provider");

const main = async () => {
  const apiAddr = "http://localhost:8000";

  const url = apiAddr + "/graphql";

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: "no-cache",
      // errorPolicy: "ignore",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  };

  const apolloClient = new ApolloClient({
    uri: url,
    cache: new InMemoryCache({
      fragments: createFragmentRegistry(gql(biz.fragments)),
    }),
    defaultOptions,
  });

  const dataProvider = await biz.createDataProvider({ apolloClient });

  console.log(
    await dataProvider.getOne("User", {
      id: "660173839fb9716ac27f2e9a",
    })
  );
  console.log(
    await dataProvider.getMany("User", {
      ids: [
        "660173839fb9716ac27f2e9a",
        "660173a49fb9716ac27f2e9c",
        "6609418087da0d2d64a6a2c2",
      ],
    })
  );
  console.log(
    await dataProvider.getList("User", {
      filter: { name: "qwer" },
      sort: {
        field: "name",
        order: "ASC",
      },
      pagination: { page: 1, perPage: 3 },
    })
  );
  console.log("Fragments: ", biz.fragments);
  console.log("Fragments Metadata: ", biz.fragmentsMetadata);
};

main();
