import { jest } from '@jest/globals';

const tableHandlers = new Map();
const storageHandlers = new Map();

const uploadFileMock = jest.fn();
const deleteFileMock = jest.fn();
const getFilePathFromUrlMock = jest.fn();

export const setSupabaseHandler = (table, operation, handler) => {
  if (!tableHandlers.has(table)) {
    tableHandlers.set(table, {});
  }
  tableHandlers.get(table)[operation] = handler;
};

export const setStorageHandler = (bucket, operation, handler) => {
  if (!storageHandlers.has(bucket)) {
    storageHandlers.set(bucket, {});
  }
  storageHandlers.get(bucket)[operation] = handler;
};

export const clearSupabaseHandlers = () => {
  tableHandlers.clear();
  storageHandlers.clear();
  uploadFileMock.mockReset();
  deleteFileMock.mockReset();
  getFilePathFromUrlMock.mockReset();
};

const runHandler = (table, operation, context) => {
  const handlers = tableHandlers.get(table) || {};
  const handler = handlers[operation];
  if (!handler) {
    return { data: null, error: null };
  }
  return handler(context);
};

const runStorageHandler = (bucket, operation, context) => {
  const handlers = storageHandlers.get(bucket) || {};
  const handler = handlers[operation];
  if (!handler) {
    return { data: null, error: null };
  }
  return handler(context);
};

const createBuilder = (table) => {
  const context = {
    table,
    operation: null,
    filters: [],
    payload: null,
    selectArgs: null,
    orderArgs: [],
    limitArgs: null,
    rangeArgs: null,
  };

  const builder = {
    select(args) {
      context.selectArgs = args;
      if (!context.operation) {
        context.operation = 'select';
      }
      return builder;
    },
    insert(payload) {
      context.operation = 'insert';
      context.payload = payload;
      return builder;
    },
    update(payload) {
      context.operation = 'update';
      context.payload = payload;
      return builder;
    },
    delete() {
      context.operation = 'delete';
      return builder;
    },
    eq(column, value) {
      context.filters.push({ type: 'eq', column, value });
      return builder;
    },
    gte(column, value) {
      context.filters.push({ type: 'gte', column, value });
      return builder;
    },
    lte(column, value) {
      context.filters.push({ type: 'lte', column, value });
      return builder;
    },
    in(column, value) {
      context.filters.push({ type: 'in', column, value });
      return builder;
    },
    order(column, options) {
      context.orderArgs.push({ column, options });
      if (!context.operation) {
        context.operation = 'select';
      }
      return builder;
    },
    limit(count) {
      context.limitArgs = count;
      return builder;
    },
    range(from, to) {
      context.rangeArgs = { from, to };
      return builder;
    },
    single() {
      const baseOperation = context.operation || 'select';
      const op = baseOperation === 'select' ? 'single' : baseOperation;
      return Promise.resolve(runHandler(table, op, context));
    },
    maybeSingle() {
      const baseOperation = context.operation || 'select';
      const op = baseOperation === 'select' ? 'single' : baseOperation;
      return Promise.resolve(runHandler(table, op, context));
    },
    then(onFulfilled, onRejected) {
      const baseOperation = context.operation || 'select';
      const result = runHandler(table, baseOperation, context);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
};

const supabaseMock = {
  from: (table) => createBuilder(table),
  rpc: (fnName, params) =>
    Promise.resolve(
      runHandler(`rpc:${fnName}`, 'rpc', { fnName, params })
    ),
  storage: {
    from: (bucket) => ({
      upload: jest.fn((path, file, options) =>
        Promise.resolve(
          runStorageHandler(bucket, 'upload', {
            bucket,
            path,
            file,
            options,
          })
        )
      ),
      remove: (paths) =>
        Promise.resolve(
          runStorageHandler(bucket, 'remove', { bucket, paths })
        ),
      getPublicUrl: (path) => {
        const result = runStorageHandler(bucket, 'getPublicUrl', {
          bucket,
          path,
        });
        if (result && result.data) {
          return result;
        }
        return {
          data: { publicUrl: `https://storage.test/${bucket}/${path}` },
          error: null,
        };
      },
    }),
  },
};

export const setupSupabaseMock = () =>
  jest.unstable_mockModule('@supabase/supabase-js', () => ({
    createClient: () => supabaseMock,
  }));

export const setupUtilsMock = () =>
  jest.unstable_mockModule('../src/utils.js', () => ({
    uploadFile: uploadFileMock,
    deleteFile: deleteFileMock,
    getFilePathFromUrl: getFilePathFromUrlMock,
    validateDate: (dateStr) => {
      if (!dateStr) return true;
      const date = new Date(dateStr);
      return !Number.isNaN(date.getTime());
    },
    supabaseClient: supabaseMock,
  }));

export {
  supabaseMock,
  uploadFileMock,
  deleteFileMock,
  getFilePathFromUrlMock,
};
