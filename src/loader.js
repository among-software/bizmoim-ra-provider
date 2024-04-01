// const Lodash = require("lodash");
// const { gql } = require("@apollo/client/core");
// const { fragments } = require("./fragments");

import * as Lodash from "lodash";
import { gql } from "@apollo/client";
import { fragments } from "./fragments";

const createEndponitNameReadOne = (typeName) =>
  Lodash.camelCase(typeName + " read one");
const createEndponitNameReadMany = (typeName) =>
  Lodash.camelCase(typeName + " read many");
const createEndponitNameReadPage = (typeName) =>
  Lodash.camelCase(typeName + " read page");

const createQueryReadOne = (typeName) => {
  return gql`
  query Query($filter: Filter) {
    ${createEndponitNameReadOne(typeName)}(
      nullable: false
      filter: $filter
    ) { ...f_${typeName} }
  }`;
};

const createQueryReadMany = (typeName) => {
  return gql`
    query a($filter: Filter, $sort: Sort) {
    ${createEndponitNameReadMany(typeName)}(
        filter: $filter
        sort: $sort
      ) { ...f_${typeName} }
    }`;
};

const createQueryReadPage = (typeName) => {
  return gql`
    query a($filter: Filter, $sort: Sort, $pageOptions: PageOptions) {
    ${createEndponitNameReadPage(typeName)}(
      filter: $filter
      sort: $sort
      pageOptions: $pageOptions
      ) { 
        count
        edges {
          node {
            ...f_${typeName}
          }
        }
      }
    }`;
};

export const createLoader = async ({ apolloClient }) => {
  const readPage = async (resource, { filter, sort, pageOptions }) => {
    const result = await apolloClient.query({
      query: createQueryReadPage(resource),
      variables: {
        filter,
        sort,
        pageOptions,
      },
    });
    return result.data[createEndponitNameReadPage(resource)];
  };

  const readOne = async (resource, id) => {
    const result = await apolloClient.query({
      query: createQueryReadOne(resource),
      variables: {
        filter: { _id: { $oid: id } },
      },
    });
    return result.data[createEndponitNameReadOne(resource)];
  };

  const readManyOrderedId = async (resource, ids) => {
    const result = await apolloClient.query({
      query: createQueryReadMany(resource),
      variables: {
        filter: { $or: ids.map((a) => ({ _id: { $oid: a } })) },
      },
    });

    const objectDict = new Map(
      result.data[createEndponitNameReadMany(resource)].map((a) => [
        a._id.$oid,
        a,
      ])
    );
    const objs = ids.map((strid) => {
      const id = strid;
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
    fragments,
  };
};
