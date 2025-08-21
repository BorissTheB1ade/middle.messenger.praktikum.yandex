/* eslint-disable class-methods-use-this */
enum HTTPMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

type HTTPData = Record<string, unknown> | null;

interface HTTPOptions {
  method?: HTTPMethods;
  data?: HTTPData;
  headers?: Record<string, string>;
  timeout?: number;
  tries?: number;
}

function queryStringify(data: HTTPData | undefined | null): string {
  let paramString = '';
  if (!data || typeof data !== 'object') return '';

  const entries = Object.entries(data);
  const paramsCount = entries.length;

  if (paramsCount > 0) {
    paramString += '?';
    entries.forEach(([key, value], index) => {
      paramString += `${key}=${value}`;
      if (index < paramsCount - 1) {
        paramString += '&';
      }
    });
  }

  return paramString;
}

async function fetchWithRetry(url: string, options: HTTPOptions = {}): Promise<XMLHttpRequest> {
  const { tries = 1 } = options;

  function onError(err: Error): Promise<XMLHttpRequest> {
    const triesLeft = tries - 1;
    if (triesLeft <= 0) {
      throw err;
    }

    return fetchWithRetry(url, { ...options, tries: triesLeft });
  }
  // eslint-disable-next-line no-use-before-define
  const transport = new HTTPTransport();
  return transport.request(url, options).catch(onError);
}

class HTTPTransport {
  get = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => fetchWithRetry(url, { ...options, method: HTTPMethods.GET });

  put = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => fetchWithRetry(url, { ...options, method: HTTPMethods.PUT });

  post = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => fetchWithRetry(url, { ...options, method: HTTPMethods.POST });

  delete = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => fetchWithRetry(url, { ...options, method: HTTPMethods.DELETE });

  request = (url: string, options: HTTPOptions, timeout: number = 5000): Promise<XMLHttpRequest> => new Promise((resolve, reject) => {
    const { method, data, headers = {} } = options;
    if (!method) {
      reject(new Error('No method'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const newTimeout = options.timeout || timeout;

    const timeoutId = setTimeout(() => {
      xhr.abort();
      reject(new Error(`Request timeout (${newTimeout}ms)`));
    }, newTimeout);

    const isMethodGet = method === HTTPMethods.GET;
    const requestUrl = isMethodGet ? url + queryStringify(data) : url;

    xhr.open(method, requestUrl);

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          xhr.setRequestHeader(key, value);
        }
      });
    }

    if (!isMethodGet && !headers['Content-Type']) {
      xhr.setRequestHeader('Content-Type', 'text/plain');
    }

    xhr.onload = () => {
      clearTimeout(timeoutId);
      resolve(xhr);
    };

    xhr.onabort = () => {
      clearTimeout(timeoutId);
      reject(new Error('Request aborted'));
    };

    xhr.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Network error'));
    };

    xhr.ontimeout = () => {
      clearTimeout(timeoutId);
      reject(new Error('Request timeout'));
    };

    xhr.send(isMethodGet ? null : JSON.stringify(data));
  });
}
