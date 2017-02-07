import { normalize } from 'normalizr';
import fetchIntercept from 'fetch-intercept';

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

export default {
  baseUrl: 'https://jsonplaceholder.typicode.com/',
  normalizeResponse: (response, schema) => {
    return normalize(response, Array.isArray(response) ? [schema] : schema);
  },
  onServerError: (e) => {
    console.log(e);
  }
};
