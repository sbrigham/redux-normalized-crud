import { normalize } from 'normalizr';
import { setBaseUrl } from 'redux-normalized-crud';

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
