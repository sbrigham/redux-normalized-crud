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
          index: 'pending'
        }
      }
    };

    const secondAction = {
      ...firstAction,
      paginate: {
        groupBy: {
          key: 'status',
          index: 'accepted'
        }
      }
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
          },
          accepted: {
            ...defaultState,
            isLoading: true,
          }
        }
      }
    })
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
          index: '1'
        }
      }
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
          },
        },
        byUser: {
          1: {
            ...defaultState,
            isLoading: true,
          }
        }
      }
    })
  })
});
