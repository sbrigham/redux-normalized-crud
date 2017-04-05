import { normalize, schema } from 'normalizr';
import { groupingReducer, defaultState } from '../../src/reducer';
import genConstants from '../../src/constants';

/*
  Make sure direction gets in there.
  Make sure metadata on every request makes sense
  Make Optimistic more readable / remove entity stuff
*/

const constants = genConstants('events');
const reducer = groupingReducer(constants);
describe('Groupings Reducer', () => {
  it('Does not do anything for GET_REQUEST, GET_SUCCESS', () => {
    const action = {
      type: constants.GET_SUCCESS,
      group: {},
      normalize: {
        result: [1],
      },
    };

    const nextState = reducer(defaultState, action);
    expect(nextState.ids.length).toBe(0);
    expect(nextState).toEqual(defaultState);
  });

  describe('CREATE REQUESTS', () => {
    it('Sets isLoading = true', () => {
      const action = {
        type: constants.CREATE_REQUEST,
        group: {},
      };

      const nextState = reducer(defaultState, action);
      expect(nextState.isLoading).toBe(true);
    });

    it('Sets hasMadeRequest = true', () => {
      const action = {
        type: constants.CREATE_REQUEST,
        group: {},
      };

      const nextState = reducer(defaultState, action);
      expect(nextState.hasMadeRequest).toBe(true);
    });

    describe('CREATE_SUCCESS', () => {
      it('Works', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
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

        expect(nextState.ids.length).toEqual(3);
        expect(nextState.ids[2]).toEqual(3);
      });
      
      it('Handles direction next', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
          group: { direction: 'next' },
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

        expect(nextState.ids.length).toEqual(3);
        expect(nextState.ids[2]).toEqual(3);
      });

      it('Handles prev', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
          group: { direction: 'prev' },
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

        expect(nextState.ids.length).toEqual(3);
        expect(nextState.ids[0]).toEqual(3);
      });

      it('Handles \'reset\'', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
          group: { reset: true },
          normalize: {
            result: 3,
          },
        };
        const nextState = reducer({
          ids: [
            1, 2, 3, 4,
          ],
          totalItems: 5,
        }, action);

        expect(nextState.ids.length).toEqual(1);
        expect(nextState.ids[0]).toEqual(3);
      });

      it('Swaps out an optimistic record for the new one', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
          group: { direction: 'prev' },
          normalize: {
            result: 3,
          },
          meta: {
            optimisticTransactionId: 'abc123',
          },
        };
        const nextState = reducer({
          ids: [
            'abc123', 2,
          ],
          totalItems: 5,
        }, action);

        expect(nextState.ids.length).toEqual(2);
        expect(nextState.ids[0]).toEqual(3);
      });

      it('Increments totalItems by 1', () => {
        const action = {
          type: constants.CREATE_SUCCESS,
          group: { direction: 'next' },
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

        expect(nextState.ids.length).toEqual(3);
        expect(nextState.totalItems).toEqual(6);

        const anotherNextState = reducer({
          ids: [
            1, 2,
          ],
        }, action);
        expect(anotherNextState.ids.length).toEqual(3);
        expect(anotherNextState.totalItems).toEqual(3);
      });
    });
  });

  describe('LIST REQUESTS', () => {
    it('Sets has made request after a get request', () => {
      const firstAction = {
        type: constants.LIST_REQUEST,
        group: {},
      };

      const nextState = reducer({}, firstAction);
      expect(nextState.hasMadeRequest).toBe(true);
    });

    it('Allows for multiple groupings of the same key', () => {
      const firstAction = {
        type: constants.LIST_REQUEST,
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
            key: 'status',
            index: 'accepted',
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
            accepted: {
              ...defaultState,
              isLoading: true,
              hasMadeRequest: true,
            },
          },
        },
      });
    });

    it('Allows for multiple groups of different keys', () => {
      const firstAction = {
        type: constants.LIST_REQUEST,
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

    describe('GET_SUCCESS', () => {
      it('Works', () => {
        const action = {
          type: constants.LIST_SUCCESS,
          group: {},
          normalize: {
            result: [1],
          },
        };

        const nextState = reducer({ ids: [] }, action);
        expect(nextState.ids[0]).toBe(1);
        expect(nextState.ids.length).toBe(1);
      });

      it('Does not group a response if it is not an array', () => {
        const action = {
          type: constants.LIST_SUCCESS,
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

      it('Sets metadata on a particular grouping from the request', () => {
        const firstAction = {
          type: constants.LIST_SUCCESS,
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

      it('Has a unique set of ids', () => {
        const action = {
          type: constants.LIST_SUCCESS,
          group: {},
          normalize: {
            result: [1, 2],
          },
        };

        const nextState = reducer({ ids: [1, 2, 3] }, action);
        expect(nextState.ids[0]).toBe(1);
        expect(nextState.ids.length).toBe(3);
      });

      it('Handles \'reset\'', () => {
        const action = {
          type: constants.LIST_SUCCESS,
          group: { reset: true },
          normalize: {
            result: [1],
          },
        };

        const nextState = reducer({ ids: [1, 2, 3, 4] }, action);
        expect(nextState.ids[0]).toBe(1);
        expect(nextState.ids.length).toBe(1);
      });

      it('Adds additional ids to the end of ids array with direction = next', () => {
        const action = {
          type: constants.LIST_SUCCESS,
          group: { direction: 'next' },
          normalize: {
            result: [5, 6],
          },
        };

        const nextState = reducer({ ids: [1, 2, 3, 4] }, action);
        expect(nextState.ids.length).toBe(6);
        expect(nextState.ids[3]).toBe(4);
        expect(nextState.ids[4]).toBe(5);
        expect(nextState.ids[5]).toBe(6);
      });

      it('Adds additional ids to the end of ids array with direction = prev', () => {
        const action = {
          type: constants.LIST_SUCCESS,
          group: { direction: 'prev' },
          normalize: {
            result: [5, 6],
          },
        };

        const nextState = reducer({ ids: [1, 2, 3, 4] }, action);
        expect(nextState.ids.length).toBe(6);
        expect(nextState.ids[0]).toBe(5);
        expect(nextState.ids[1]).toBe(6);
        expect(nextState.ids[2]).toBe(1);
      });
    });
  });

  describe('UPDATE REQUESTS', () => {
    it('Sets isLoading = true when a request is made', () => {
      const firstAction = {
        type: constants.UPDATE_REQUEST,
        group: {},
      };

      const nextState = reducer({}, firstAction);
      expect(nextState.isLoading).toBe(true);
    });

    it('Sets hasMadeRequest = true when a request is made', () => {
      const firstAction = {
        type: constants.UPDATE_REQUEST,
        group: {},
      };
      const nextState = reducer({}, firstAction);
      expect(nextState.hasMadeRequest).toBe(true);
    });

    it('Sets isLoading = false when a request is made', () => {
      const firstAction = {
        type: constants.UPDATE_SUCCESS,
        group: {},
      };
      const nextState = reducer({}, firstAction);
      expect(nextState.isLoading).toBe(false);
    });
  });

  describe('DELETE REQUESTS', () => {
    it('Decrements totalItems on success', () => {
      const action = {
        type: constants.DELETE_SUCCESS,
        group: { },
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

      expect(nextState.ids.length).toEqual(2);
      expect(nextState.ids[0]).toEqual(1);
      expect(nextState.totalItems).toEqual(5);

      const nextNewState = reducer({
        ids: [
          1, 2, 3,
        ],
        totalItems: 5,
      }, action);

      expect(nextNewState.ids.length).toEqual(2);
      expect(nextNewState.ids[0]).toEqual(1);
      expect(nextNewState.ids[1]).toEqual(2);
      expect(nextNewState.totalItems).toEqual(4);
    });
  
    it('Removes the item on success', () => {
      const action = {
        type: constants.DELETE_SUCCESS,
        group: { },
        normalize: {
          result: 2,
        },
      };
      const nextState = reducer({
        ids: [
          1, 2,
        ],
        totalItems: 5,
      }, action);

      expect(nextState.ids.length).toEqual(1);
      expect(nextState.ids[0]).toEqual(1);
      expect(nextState.totalItems).toEqual(4);
    });
  });

  describe('OPTIMISITC REQUESTS', () => {
    describe('Creates', () => {
      it('Works', () => {
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
      });
     
      it('Works with direction - next', () => {
        const action = {
          type: constants.OPTIMISTIC_REQUEST,
          group: { direction: 'next' },
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
      });

      it('Works with direction - prev', () => {
        const action = {
          type: constants.OPTIMISTIC_REQUEST,
          group: { direction: 'prev' },
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
        expect(nextState.ids[0]).toEqual(3);
        expect(nextState.ids[1]).toEqual(1);
        expect(nextState.ids[2]).toEqual(2);
      });
    });

    it('Updates', () => {
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
