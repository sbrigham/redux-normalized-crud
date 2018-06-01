import genConstants from '../../src/constants';

describe('Constants', () => {
  it('Contains all the keyworks', () => {
    const constants = genConstants('post');
    expect(constants).toEqual({
      CREATE_REQUEST: 'POST_CREATE_REQUEST',
      CREATE_SUCCESS: 'POST_CREATE_SUCCESS',
      CREATE_FAILURE: 'POST_CREATE_FAILURE',
      UPDATE_REQUEST: 'POST_UPDATE_REQUEST',
      UPDATE_SUCCESS: 'POST_UPDATE_SUCCESS',
      UPDATE_FAILURE: 'POST_UPDATE_FAILURE',
      DELETE_REQUEST: 'POST_DELETE_REQUEST',
      DELETE_SUCCESS: 'POST_DELETE_SUCCESS',
      DELETE_FAILURE: 'POST_DELETE_FAILURE',
      OPTIMISTIC_REQUEST: 'POST_OPTIMISTIC_REQUEST',
      OPTIMISTIC_SUCCESS: 'POST_OPTIMISTIC_SUCCESS',
      OPTIMISTIC_FAILURE: 'POST_OPTIMISTIC_FAILURE',
      GET_REQUEST: 'POST_GET_REQUEST',
      GET_SUCCESS: 'POST_GET_SUCCESS',
      GET_FAILURE: 'POST_GET_FAILURE',
    });
  });

  it('Lets you only specify read only', () => {
    const constants = genConstants('post', true);
    expect(constants).toEqual({
      GET_REQUEST: 'POST_GET_REQUEST',
      GET_SUCCESS: 'POST_GET_SUCCESS',
      GET_FAILURE: 'POST_GET_FAILURE',
    });
  });
});
