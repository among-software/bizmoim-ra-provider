// const { createLoader } = require("./loader");
import { createLoader } from './loader';

class NotImplementedError extends Error {
  constructor() {
    super('This function is not implemented.');
  }
}

const fnNotImplemented = () => {
  throw new NotImplementedError();
};

const toMongoDirec = (a) => {
  switch (a) {
    case 'ASC':
      return 1;
    case 'DESC':
      return -1;
    default:
      throw new Error('Sort invalid, the following value is given:' + a);
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
    [params.sort.field]: toMongoDirec(params.sort.order),
  };
  return sort;
};

const filterFormatter = (key, value) => {
  console.log(key);
  if (key === 'createdAt') {
    return new Date(value).toISOString();
  }
  return value;
};

const createDataProvider = async ({ apolloClient }) => {
  const loader = await createLoader({ apolloClient });

  const dataProvider = {
    getList: async (resource, params) => {
      const pageOptions = getPageOptions(params);
      const sort = getSort(params);
      const filter = params.filter;
      const submitAbleFilter = {};
      // gte, lte등 필터 data-provider에서 처리해줘야함, __filter__로 구분하기로함
      Object.entries(filter).forEach(([key, value]) => {
        const keyList = key.split('__filter__');
        const formatingValue = filterFormatter(keyList[0], value);
        if (keyList.length === 2) {
          const filterKey = keyList[1];
          if (submitAbleFilter[keyList[0]] != null) {
            submitAbleFilter[keyList[0]] = {
              ...submitAbleFilter[keyList[0]],
              [filterKey]: formatingValue,
            };
            return;
          }
          submitAbleFilter[keyList[0]] = { [filterKey]: formatingValue };
          return;
        }
        submitAbleFilter[key] = formatingValue;
      });
      console.log('ra-provider filter', submitAbleFilter);

      const result = await loader.readPage(resource, {
        filter: submitAbleFilter,
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

export * from './fragments';
export { createDataProvider };
// module.exports.createDataProvider = createDataProvider;
// module.exports.fragments = require("./fragments").fragments;
// module.exports.fragmentsMetadata = require("./fragments").fragmentsMetadata;
