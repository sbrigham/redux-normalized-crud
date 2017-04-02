import { registerEntity } from 'redux-normalized-crud';
import { schema } from 'normalizr';
import config from './config';

export const {
  constants,
  creators,
  groupingSelector,
  entitySelector,
  sagas,
} = registerEntity(config, new schema.Entity('posts'));
