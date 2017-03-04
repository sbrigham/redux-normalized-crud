import Qs from 'qs';
import CustomError from './errors';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
export default (baseURL, fetchInstance, config = {}) => {
  const headers = config.headers;
  const handleErrors = (response) => {
    if (!response.ok) throw new CustomError(response);
    return response;
  };

  const get = (url, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
      ...config,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const post = (url, body, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
      method: 'POST',
      body: JSON.stringify(body),
      ...config,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const put = (url, body, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...config,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  return {
    get,
    post,
    put,
    delete: (url, body, params) => (
      fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        ...config,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      })
      .then(handleErrors)
      .then(response => response.json())
    ),
  };
};
