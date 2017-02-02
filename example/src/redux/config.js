import { normalize } from 'normalizr';

export default {
  baseUrl: 'https://jsonplaceholder.typicode.com/',
  normalizeResponse: (response, schema) => {
    return normalize(response, Array.isArray(response) ? [schema] : schema);
  }
};
