import fetch from 'whatwg-fetch';
import Qs from 'qs';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default (baseURL, headers = defaultHeaders) => {
  const handleErrors = (response) => {
    if (response.status >= 500) {
      throw Error(response);
    }
    return response;
  };

  const get = (url, params) => {
    return fetch(`${url}?${Qs.stringify(params)}`, {
      credentials: 'same-origin',
      headers,
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const post = (url, body, params) => {
    return fetch(`${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: JSON.stringify(body),
      headers,
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const put = (url, body, params) => {
    return fetch(`${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: JSON.stringify(body),
      headers,
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  return {
    get,
    post,
    put,
    delete: (url, body, params) => (
      fetch(`${url}?${Qs.stringify(params)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        body: JSON.stringify(body),
        headers,
      })
      .then(handleErrors)
      .then(response => response.json())
    ),
  }
}
