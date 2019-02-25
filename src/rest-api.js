import Qs from 'qs';
import axios from 'axios';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const requestUrl = (baseUrl, url, params) =>
  `${baseUrl}${url}?${Qs.stringify(params)}`;

const buildConfig = config => {
  const overrideHeaders = config.headers || {};
  return {
    ...config,
    headers: {
      ...defaultHeaders,
      ...overrideHeaders,
    },
  };
};

export default base => {
  let baseUrl = base || '/';
  const setBaseUrl = newBaseUrl => {
    baseUrl = newBaseUrl;
  };

  const axiosBodyRequest = (verb, url, body, params, config = {}) =>
    axios[verb](requestUrl(baseUrl, url, params), body, buildConfig(config));

  const get = (url, params, config = {}) =>
    axios.get(requestUrl(baseUrl, url, params), buildConfig(config));

  const post = (url, body, params, config = {}) =>
    axiosBodyRequest('post', url, body, params, config);

  const patch = (url, body, params, config = {}) =>
    axiosBodyRequest('patch', url, body, params, config);

  const put = (url, body, params, config = {}) =>
    axiosBodyRequest('put', url, body, params, config);

  const deleteCall = (url, params, config = {}) =>
    axios.delete(requestUrl(baseUrl, url, params), buildConfig(config));

  return {
    get,
    post,
    patch,
    put,
    delete: deleteCall,
    setBaseUrl,
  };
};
