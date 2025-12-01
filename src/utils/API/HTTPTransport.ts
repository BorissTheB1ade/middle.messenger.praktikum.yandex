/* eslint-disable class-methods-use-this */
export enum HTTPMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

type HTTPData = Record<string, unknown> | FormData | null;

interface HTTPOptions {
  method?: HTTPMethods;
  data?: HTTPData;
  headers?: Record<string, string>;
  timeout?: number;
  tries?: number;
}

export function queryStringify(data: HTTPData | undefined | null): string {
  if (!data || typeof data !== 'object' || data instanceof FormData) return '';

  const entries = Object.entries(data);
  const paramsCount = entries.length;

  if (paramsCount === 0) return '';

  return `?${entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}`;
}

class HTTPTransport {
  private baseURL = 'https://ya-praktikum.tech/api/v2';

  private getFullUrl(url: string): string {
    return url.startsWith('http') ? url : `${this.baseURL}${url}`;
  }

  private getHeaders(data?: HTTPData): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  get = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => this.fetchWithRetry(url, { ...options, method: HTTPMethods.GET });

  put = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => this.fetchWithRetry(url, { ...options, method: HTTPMethods.PUT });

  post = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => this.fetchWithRetry(url, { ...options, method: HTTPMethods.POST });

  delete = (url: string, options: Omit<HTTPOptions, 'method'> = {}): Promise<XMLHttpRequest> => this.fetchWithRetry(url, { ...options, method: HTTPMethods.DELETE });

  private async fetchWithRetry(url: string, options: HTTPOptions = {}): Promise<XMLHttpRequest> {
    const { tries = 1 } = options;

    const onError = (err: Error): Promise<XMLHttpRequest> => {
      const triesLeft = tries - 1;
      if (triesLeft <= 0) {
        throw err;
      }

      return this.fetchWithRetry(url, { ...options, tries: triesLeft });
    };

    return this.request(url, options).catch(onError);
  }

  request = (url: string, options: HTTPOptions, timeout: number = 5000): Promise<XMLHttpRequest> => new Promise((resolve, reject) => {
    const { method, data, headers = {} } = options;
    if (!method) {
      reject(new Error('No method'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const fullUrl = this.getFullUrl(url);
    const allHeaders = { ...this.getHeaders(data), ...headers };
    const newTimeout = options.timeout || timeout;

    const timeoutId = setTimeout(() => {
      xhr.abort();
      reject(new Error(`Request timeout (${newTimeout}ms)`));
    }, newTimeout);

    const isMethodGet = method === HTTPMethods.GET;
    const requestUrl = isMethodGet ? fullUrl + queryStringify(data) : fullUrl;

    xhr.open(method, requestUrl);

    Object.entries(allHeaders).forEach(([key, value]) => {
      if (value) {
        xhr.setRequestHeader(key, value);
      }
    });

    xhr.withCredentials = true;

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

    let body: Document | XMLHttpRequestBodyInit | null = null;
    if (isMethodGet) {
      body = null;
    } else if (data instanceof FormData) {
      body = data;
    } else {
      body = data ? JSON.stringify(data) : null;
    }

    xhr.send(body);
  });
}

export default HTTPTransport;
