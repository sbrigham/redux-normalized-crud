import { registerEntity } from 'redux-normalized-crud'
import config from './config';
import { schema } from 'normalizr';

export const {
  sagas,
  constants,
  creators,
  paginationSelector,
  entitySelector
} = registerEntity(config, new schema.Entity('posts'));
