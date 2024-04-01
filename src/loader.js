const fs = require("fs");
const Lodash = require("lodash");

const fragments = fs.readFileSync("./src/fragments.graphql");

const createQueryReadOne = (typeName) => {
  return (
    fragments +
    `query a($filter: Filter) {
    ${Lodash.camelCase(typeName + "read one")}(
      nullable: false
      filter: $filter
    ) { ...t_${typeName} }
  }`
  );
};

const createQueryReadMany = (typeName) => {
  return (
    fragments +
    `query a($filter: Filter, $sort: Sort) {
    ${Lodash.camelCase(typeName + "read many")}(
      filter: $filter
      sort: $sort
      ) { ...t_${typeName} }
  }`
  );
};

const createQueryReadPage = (typeName) => {
  return (
    fragments +
    `query a($filter: Filter, $sort: Sort, $pageOptions PageOptions) {
    ${Lodash.camelCase(typeName + "read page")}(
      filter: $filter
      sort: $sort
      pageOptions: $pageOptions
      ) { ...t_${typeName} }
  }`
  );
};

const createLoader = async ({ apolloClient }) => {
  const readPage = async (resource, { filter, sort, pageOptions }) => {
    const result = await apolloClient.query({
      query: createQueryReadPage(resource),
      variables: {
        filter,
        sort,
        pageOptions,
      },
    });
    return result.data.a;
  };

  const readOne = async (resource, id) => {
    const result = await apolloClient.query({
      query: createQueryReadOne(resource),
      variables: {
        filter: { _id: { $oid: id } },
      },
    });
    return result.data.a;
  };

  const readManyOrderedId = async (resource, ids) => {
    const result = await apolloClient.query({
      query: createQueryReadMany(resource),
      variables: {
        filter: { $or: ids.map((a) => ({ $oid: a })) },
      },
    });
    const objectDict = new Map(result.data.a.map((a) => [a._id.$oid, a]));
    const objs = ids.map((oid) => {
      const id = oid.$oid;
      const doc = objectDict.get(id);
      if (doc == null) {
        throw new Error("Cannot find doc");
      }
      return doc;
    });
    return objs;
  };

  return {
    readOne,
    readPage,
    readManyOrderedId,
  };
};

exports.loader = createLoader;
