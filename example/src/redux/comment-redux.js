import generate from 'redux-normalized-crud'
import { config } from './config';
import { schema } from 'normalizr';
import { entity as postEntity } from './post-redux';

const comments = new schema.Entity('comments');

comments.define({
  postId: postEntity
});

export const entity = comments;

const generator = generate(config);
export const { sagas, constants, creators } = generator.registerEntity(entity);
