import { normalize } from 'normalizr';

export const config = {
  baseUrl: 'https://jsonplaceholder.typicode.com/',
  normalizeResponse: (response, schema) => {
    return normalize(response, Array.isArray(response) ? [schema] : schema);
  }
};
