import { normalize, schema } from 'normalizr';
import { groupingReducer, defaultState } from '../../src/reducer';
import genConstants from '../../src/constants';

/*
  Make sure direction gets in there.
  Make sure metadata on every request makes sense
  Make Optimistic more readable / remove entity stuff
*/

describe('Groupings Reducer', () => {
  describe('Create Requests', () => {});

  describe('Get Requests', () => {
    it('Sets metadata on a particular grouping from the request', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const firstAction = {
        type: constants.GET_SUCCESS,
        group: {
          by: {
            key: 'status',
            index: 'pending',
          },
        },
        normalize: normalize([
          {
            id: 1,
            name: 'test',
          }, {
            id: 2,
            name: 'test1',
          },
        ], [new schema.Entity('posts')]),
        meta: {
          responseMeta: {
            skip: 1,
            take: 'test',
          },
        },
      };

      const nextState = reducer({}, firstAction);
      expect(nextState).toEqual({
        groups: {
          byStatus: {
            pending: {
              ...defaultState,
              isLoading: false,
              totalItems: 2,
              ids: [
                1, 2,
              ],
              meta: {
                skip: 1,
                take: 'test',
              },
            },
          },
        },
      });
    });

    it('Sets has made request after a get request', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const firstAction = {
        type: constants.GET_REQUEST,
        group: {}
      };

      const nextState = reducer({}, firstAction);
      expect(nextState.hasMadeRequest).toBe(true);
    });

    it('Allows for multiple groupings of the same key', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const firstAction = {
        type: constants.GET_REQUEST,
        group: {
          by: {
            key: 'status',
            index: 'pending'
          }
        }
      };

      const secondAction = {
        ...firstAction,
        group: {
          by: {
            key: 'status',
            index: 'accepted'
          }
        }
      };

      const nextState = reducer({}, firstAction);
      const nextStateAgain = reducer(nextState, secondAction);
      expect(nextStateAgain).toEqual({
        groups: {
          byStatus: {
            pending: {
              ...defaultState,
              isLoading: true,
              hasMadeRequest: true
            },
            accepted: {
              ...defaultState,
              isLoading: true,
              hasMadeRequest: true
            }
          }
        }
      });
    });

    it('Allows for multiple groups of different keys', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const firstAction = {
        type: constants.GET_REQUEST,
        group: {
          by: {
            key: 'status',
            index: 'pending',
          },
        },
      };

      const secondAction = {
        ...firstAction,
        group: {
          by: {
            key: 'user',
            index: '1',
          },
        },
      };

      const nextState = reducer({}, firstAction);
      const nextStateAgain = reducer(nextState, secondAction);
      expect(nextStateAgain).toEqual({
        groups: {
          byStatus: {
            pending: {
              ...defaultState,
              isLoading: true,
              hasMadeRequest: true,
            },
          },
          byUser: {
            1: {
              ...defaultState,
              isLoading: true,
              hasMadeRequest: true,
            },
          },
        },
      });
    });

    it('Does not group a response if it is not an array', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const action = {
        type: constants.GET_SUCCESS,
        group: {},
        normalize: {
          result: {
            id: 1,
            name: 'Test Event',
          },
        },
      };
      const nextState = reducer({}, action);
      expect(nextState.totalItems).toBeUndefined();
    });
  });

  describe('Update Requests', () => {});

  describe('Delete Requests', () => {});

  describe('Optimistic requests', () => {
    it('Works with updates', () => {
      const constants = genConstants('events');
      const reducer = groupingReducer(constants);

      const action = {
        type: constants.OPTIMISTIC_REQUEST,
        group: {},
        normalize: {
          result: 3,
        },
      };
      const nextState = reducer({
        ids: [
          1, 2,
        ],
        totalItems: 5,
      }, action);
      expect(nextState.totalItems).toEqual(5);
      expect(nextState.ids.length).toEqual(3);
      expect(nextState.ids[0]).toEqual(1);
      expect(nextState.ids[1]).toEqual(2);
      expect(nextState.ids[2]).toEqual(3);

      const newAction = {
        type: constants.OPTIMISTIC_REQUEST,
        group: {},
        normalize: {
          result: 2,
        },
      };

      const afterState = reducer({
        ids: [
          1, 2, 3,
        ],
        totalItems: 5,
      }, newAction);
      expect(afterState.totalItems).toEqual(5);
      expect(afterState.ids.length).toEqual(3);
      expect(afterState.ids[0]).toEqual(1);
      expect(afterState.ids[1]).toEqual(2);
      expect(afterState.ids[2]).toEqual(3);
    });
  });
});
