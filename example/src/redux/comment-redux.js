import { registerEntity } from 'redux-normalized-crud'
import config from './config';
import { schema } from 'normalizr';

export const {
  sagas,
  constants,
  creators,
  pagination,
  paginationSelector,
  entitySelector,
} = registerEntity(config, new schema.Entity('comments'));
