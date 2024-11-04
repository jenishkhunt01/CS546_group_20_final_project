import dbConnection from './mongoConnection';

const getCollectionFn = (collectionName) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collectionName);
    }

    return _col;
  };
};

export const users = getCollectionFn('users');