const { createLoader } = require("./loader");

class NotImplementedError extends Error {
  constructor() {
    super("This function is not implemented.");
  }
}

const fnNotImplemented = () => {
  throw new NotImplementedError();
};

const toMongoDirec = (a) => {
  switch (a) {
    case "ASC":
      return 1;
    case "DESC":
      return -1;
    default:
      throw new Error("Sort invalid, the following value is given:" + a);
  }
};

const edgesToNodes = (edges) => {
  return edges.map((a) => a.node);
};

const getPageOptions = (params) => {
  const pageIndex = params.pagination.page - 1;
  const limit = params.pagination.perPage;
  const skip = limit * pageIndex;
  return { skip, limit };
};

const getSort = (params) => {
  const sort = {
    [params.pagination.sort.field]: toMongoDirec(params.pagination.sort.order),
  };
  return sort;
};

const createDataProvider = async ({ apolloClient }) => {
  const loader = await createLoader({ apolloClient });

  const dataProvider = {
    getList: async (resource, params) => {
      const pageOptions = getPageOptions(params);
      const sort = getSort(params);
      const filter = params.filter;

      const result = await loader.readPage(resource, {
        filter,
        sort,
        pageOptions,
      });

      return {
        data: edgesToNodes(result.edges),
        total: result.count,
      };
    },
    getOne: async (resource, params) => {
      const { id } = params;
      const data = await loader.readOne(resource, id);
      return { data };
    },
    getMany: async (resource, params) => {
      const { ids } = params;
      const data = await loader.readManyOrderedId(resource, ids);
      return { data };
    },
    getManyReference: async (resource, params) => {
      const pageOptions = getPageOptions(params);
      const sort = getSort(params);
      const filter = {
        ...params.filter,
        [params.target]: params.id,
      };

      const result = await loader.readPage(resource, {
        filter,
        sort,
        pageOptions,
      });

      return {
        data: edgesToNodes(result.edges),
        total: result.count,
      };
    },
    create: fnNotImplemented,
    update: fnNotImplemented,
    updateMany: fnNotImplemented,
    delete: fnNotImplemented,
    deleteMany: fnNotImplemented,
  };
  return dataProvider;
};

module.exports.createDataProvider = createDataProvider;
