import Qs from 'qs';
import axios from 'axios';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default (base) => {
  let baseUrl = base || '/';
  const setBaseUrl = (newBaseUrl) => {
    baseUrl = newBaseUrl;
  };

  const get = (url, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return axios.get(`${baseUrl}${url}?${Qs.stringify(params)}`, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    });
  };

  const post = (url, body, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return axios.post(`${baseUrl}${url}?${Qs.stringify(params)}`, body, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    });
  };

  const patch = (url, body, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return axios.patch(`${baseUrl}${url}?${Qs.stringify(params)}`, body, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    });
  };

  const put = (url, body, params, config = {}) => {
    const overrideHeaders = config.headers || {};
    return axios.put(`${baseUrl}${url}?${Qs.stringify(params)}`, body, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...overrideHeaders,
      },
    });
  };

  return {
    get,
    post,
    patch,
    put,
    delete: (url, body, params, config = {}) => {
      const overrideHeaders = config.headers || {};
      axios.delete(`${baseUrl}${url}?${Qs.stringify(params)}`, body, {
        ...config,
        headers: {
          ...defaultHeaders,
          ...overrideHeaders,
        },
      });
    },
    setBaseUrl,
  };
};
