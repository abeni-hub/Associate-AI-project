import { fetchBaseQuery } from '@reduxjs/toolkit/query';

let captured;
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://x',
  fetchFn: async (request) => {
    captured = request;
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  },
});

process.on('unhandledRejection', (e) => { console.log('unhandled', e); });
const formData = new FormData();
formData.append('name', 'X');
formData.append('logo', new Blob(['abc'], { type: 'image/png' }), 'a.png');

console.log('fetchFn set?', typeof baseQuery);
const result = await baseQuery(
  { url: '/organizations', method: 'POST', body: formData },
  {
    signal: new AbortController().signal,
    dispatch: () => {},
    getState: () => ({}),
    extra: undefined,
    endpoint: 'createOrganization',
    type: 'mutation',
    forced: false,
    arg: undefined,
  }
);
console.log('result', JSON.stringify(result));

console.log('request type:', captured?.constructor?.name);
console.log('content-type header:', captured?.headers?.get('content-type'));
console.log('body type:', captured?.body?.constructor?.name);
