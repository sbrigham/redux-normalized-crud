import generate from 'redux-normalized-crud'
import { config } from './config';
import { schema } from 'normalizr';

export const entity = new schema.Entity('posts');
const generator = generate(config);
export const { sagas, constants, creators } = generator.registerEntity(entity);
