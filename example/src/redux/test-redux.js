import { registerEntity } from 'redux-normalized-crud';
import { schema } from 'normalizr';
import config from './config';

export const {
  sagas,
  constants,
  creators,
  groupingSelector,
  entitySelector,
} = registerEntity(config, new schema.Entity('test'));
