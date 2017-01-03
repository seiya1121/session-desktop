import 'whatwg-fetch';

const AppKey = 'dc6zaTOxFJmzC';
const Host = 'http://api.giphy.com';
const SearchPath = 'v1/gifs/search';
const url = (path, queryString) => `${Host}/${path}/${queryString}`;

const getGifUrl = (key) => {
  console.log(key);
  const query = `?q=${key}&api_key=${AppKey}&limit=1`;
  fetch(url(SearchPath, query))
  .then((res) => {
    console.log(res);
  });
};

export default getGifUrl;
