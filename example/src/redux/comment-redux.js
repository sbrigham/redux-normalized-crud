import { registerEntity } from 'redux-normalized-crud'
import config from './config';
import { schema } from 'normalizr';

export const {
  constants,
  creators,
  paginationSelector,
  entitySelector,
  sagas,
} = registerEntity(config, new schema.Entity('comments'));
