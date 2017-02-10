import Qs from 'qs';
import customError from './errors'

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default (baseURL, fetchInstance = fetch, headers = defaultHeaders) => {
  const handleErrors = (response) => {
    if (!response.ok) throw new customError(response);
    return response;
  };

  const get = (url, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
      headers
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const post = (url, body, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    })
    .then(handleErrors)
    .then(response => response.json());
  };

  const put = (url, body, params) => {
    return fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
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
      fetchInstance(`${baseURL}${url}?${Qs.stringify(params)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers,
      })
      .then(handleErrors)
      .then(response => response.json())
    ),
  }
}
