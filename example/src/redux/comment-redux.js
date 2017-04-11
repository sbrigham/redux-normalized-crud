import { registerEntity } from 'redux-normalized-crud';
import { schema } from 'normalizr';
import config from './config';

export const {
  constants,
  creators,
  groupSelector,
  entitySelector,
  sagas,
} = registerEntity({ ...config, baseUrl: `${config.baseUrl}comments` }, new schema.Entity('comments'));
