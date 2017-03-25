import Qs from 'qs';
import CustomError from './errors';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default (base) => {
  let baseUrl = base || '/';
  const handleErrors = (response) => {
    if (!response.ok) throw new CustomError(response);
    return response;
  };

  const setBaseUrl = (newBaseUrl) => {
    baseUrl = newBaseUrl;
  };

  const get = (url, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return fetch(`${baseUrl}${url}?${Qs.stringify(params)}`, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const post = (url, body, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return fetch(`${baseUrl}${url}?${Qs.stringify(params)}`, {
      method: 'POST',
      body: JSON.stringify(body),
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const put = (url, body, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return fetch(`${baseUrl}${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  return {
    get,
    post,
    put,
    delete: (url, body, params, config = {}) => {
      const overrideHeaders = config.headers || {};
      fetch(`${baseUrl}${url}?${Qs.stringify(params)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        ...config,
        headers: {
          ...defaultHeaders,
          ...overrideHeaders,
        },
      })
      .then(handleErrors)
      .then(response => response.json());
    },
    setBaseUrl,
  };
};
