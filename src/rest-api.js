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
    return fetch(`${baseURL}${url}?${Qs.stringify(params)}`, {
      headers
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const post = (url, body, params) => {
    return fetch(`${baseURL}${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const put = (url, body, params) => {
    return fetch(`${baseURL}${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
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
      fetch(`${baseURL}${url}?${Qs.stringify(params)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers,
      })
      .then(handleErrors)
      .then(response => response.json())
    ),
  }
}
