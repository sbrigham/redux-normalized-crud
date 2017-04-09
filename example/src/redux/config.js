import { normalize } from 'normalizr';
import fetchIntercept from 'fetch-intercept';
import { setBaseUrl } from 'redux-normalized-crud';

fetchIntercept.register({
    request: function (url, config) {
      // update headers here
      return [url, config];
    },

    requestError: function (error) {
      // Called when an error occured during another 'request' interceptor call
      return Promise.reject(error);
    },

    response: function (response) {
      return response;
    },

    responseError: function (error) {
      return Promise.reject(error);
    }
});

const baseUrl = 'https://jsonplaceholder.typicode.com/';
setBaseUrl(baseUrl);

export default {
  baseUrl,
  readOnly: true,
  handleResponse: (response, schema) => {
    if (Array.isArray(response)) {
      return {
        meta: {
          skip: 1,
          randomData: 'yes',
        },
        totalItems: response.length - 1,
        normalize: normalize(response, [schema]),
      };
    }

    return {
      normalize: normalize(response, schema),
    };
  },
  onServerError: (e) => {
    console.log(e);
  },
};
