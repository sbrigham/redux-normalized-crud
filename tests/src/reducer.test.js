import { paginateReducer, defaultState } from '../../src/reducer';
import genConstants from '../../src/constants';

describe('Pagination Reducer', () => {
  it('Allows for multiple groupings of the same key', () => {
    const constants = genConstants('events');
    const reducer = paginateReducer(constants);

    const firstAction = {
      type: constants.LOAD_REQUEST,
      paginate: {
        groupBy: {
          key: 'status',
          index: 'pending',
        },
      },
    };

    const secondAction = {
      ...firstAction,
      paginate: {
        groupBy: {
          key: 'status',
          index: 'accepted',
        },
      },
    };

    const nextState = reducer({ }, firstAction);
    const nextStateAgain = reducer(nextState, secondAction);
    expect(
      nextStateAgain
    ).toEqual({
      groupings: {
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

  it('Allows for multiple groupings of different keys', () => {
    const constants = genConstants('events');
    const reducer = paginateReducer(constants);

    const firstAction = {
      type: constants.LOAD_REQUEST,
      paginate: {
        groupBy: {
          key: 'status',
          index: 'pending'
        }
      }
    };

    const secondAction = {
      ...firstAction,
      paginate: {
        groupBy: {
          key: 'user',
          index: '1',
        },
      },
    };

    const nextState = reducer({ }, firstAction);
    const nextStateAgain = reducer(nextState, secondAction);
    expect(
      nextStateAgain
    ).toEqual({
      groupings: {
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
          }
        }
      }
    })
  });

  it('Sets has made request after a load request', () => {
    const constants = genConstants('events');
    const reducer = paginateReducer(constants);

    const firstAction = {
      type: constants.LOAD_REQUEST,
      paginate: {},
    };

    const nextState = reducer({ }, firstAction);
    expect(nextState.hasMadeRequest).toBe(true);
  });

  it('Does not paginate a response if it is not an array', () => {
    const constants = genConstants('events');
    const reducer = paginateReducer(constants);

    const action = {
      type: constants.LOAD_SUCCESS,
      paginate: {},
      normalize: {
        result: {
          id: 1,
          name: 'Test Event',
        },
      },
    };
    const nextState = reducer({ }, action);
    expect(nextState.totalItems).toBeUndefined();
  });

  it('Handles optimistic requests', () => {
    const constants = genConstants('events');
    const reducer = paginateReducer(constants);

    const action = {
      type: constants.OPTIMISTIC_REQUEST,
      paginate: {},
      normalize: {
        result: 3,
      },
    };
    const nextState = reducer({ ids: [1, 2], totalItems: 5 }, action);
    expect(nextState.totalItems).toEqual(5);
    expect(nextState.ids.length).toEqual(3);
    expect(nextState.ids[0]).toEqual(1);
    expect(nextState.ids[1]).toEqual(2);
    expect(nextState.ids[2]).toEqual(3);

    const newAction = {
      type: constants.OPTIMISTIC_REQUEST,
      paginate: {},
      normalize: {
        result: 2,
      },
    };

    const afterState = reducer({ ids: [1, 2, 3], totalItems: 5 }, newAction);
    expect(afterState.totalItems).toEqual(5);
    expect(afterState.ids.length).toEqual(3);
    expect(afterState.ids[0]).toEqual(1);
    expect(afterState.ids[1]).toEqual(2);
    expect(afterState.ids[2]).toEqual(3);
  });
});
