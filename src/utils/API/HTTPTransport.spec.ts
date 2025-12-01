import { expect } from 'chai';
import HTTPTransport, { HTTPMethods, queryStringify } from './HTTPTransport';

// Mock XMLHttpRequest
class MockXMLHttpRequest {
    static lastInstance: MockXMLHttpRequest | null = null;

    method: string = '';
    url: string = '';
    headers: Record<string, string> = {};
    withCredentials: boolean = false;
    requestBody: unknown = null;

    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;
    ontimeout: (() => void) | null = null;

    constructor() {
        MockXMLHttpRequest.lastInstance = this;
    }

    open(method: string, url: string) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    send(body?: unknown) {
        this.requestBody = body;
    }

    abort() { }

    static reset() {
        MockXMLHttpRequest.lastInstance = null;
    }
}

describe('queryStringify', () => {
    it('должен возвращать пустую строку для null', () => {
        const result = queryStringify(null);
        expect(result).to.equal('');
    });

    it('должен возвращать пустую строку для undefined', () => {
        const result = queryStringify(undefined);
        expect(result).to.equal('');
    });

    it('должен возвращать пустую строку для пустого объекта', () => {
        const result = queryStringify({});
        expect(result).to.equal('');
    });

    it('должен создавать query строку из объекта', () => {
        const data = { key1: 'value1', key2: 'value2' };
        const result = queryStringify(data);
        expect(result).to.equal('?key1=value1&key2=value2');
    });

    it('должен кодировать специальные символы', () => {
        const data = { 'key with spaces': 'value&special=chars' };
        const result = queryStringify(data);
        expect(result).to.equal('?key%20with%20spaces=value%26special%3Dchars');
    });

    it('должен конвертировать числа в строки', () => {
        const data = { id: 123, count: 456 };
        const result = queryStringify(data);
        expect(result).to.equal('?id=123&count=456');
    });
});

describe('HTTPTransport', () => {
    let http: HTTPTransport;
    let originalXMLHttpRequest: typeof global.XMLHttpRequest;

    beforeEach(() => {
        http = new HTTPTransport();
        originalXMLHttpRequest = global.XMLHttpRequest;
        global.XMLHttpRequest = MockXMLHttpRequest as any;
        MockXMLHttpRequest.reset();
    });

    afterEach(() => {
        global.XMLHttpRequest = originalXMLHttpRequest;
    });

    describe('GET запросы', () => {
        it('должен создавать GET запрос с query параметрами', () => {
            http.get('/test', {
                data: { param1: 'value1', param2: 'value2' }
            });

            const xhr = MockXMLHttpRequest.lastInstance!;

            expect(xhr.method).to.equal('GET');
            expect(xhr.url).to.contain('https://ya-praktikum.tech/api/v2/test?param1=value1&param2=value2');
            expect(xhr.withCredentials).to.be.true;
            expect(xhr.headers['Content-Type']).to.equal('application/json');
        });

        it('должен создавать GET запрос без данных', () => {
            http.get('/test');

            const xhr = MockXMLHttpRequest.lastInstance!;
            expect(xhr.method).to.equal('GET');
            expect(xhr.url).to.equal('https://ya-praktikum.tech/api/v2/test');
        });
    });

    describe('POST запросы', () => {
        it('должен создавать POST запрос с JSON данными', () => {
            const data = { name: 'John', age: 30 };
            http.post('/test', { data });

            const xhr = MockXMLHttpRequest.lastInstance!;
            expect(xhr.method).to.equal('POST');
            expect(xhr.url).to.equal('https://ya-praktikum.tech/api/v2/test');
            expect(xhr.requestBody).to.equal(JSON.stringify(data));
            expect(xhr.headers['Content-Type']).to.equal('application/json');
        });

        it('должен устанавливать кастомные заголовки', () => {
            http.post('/test', {
                data: { key: 'value' },
                headers: { 'X-Custom-Header': 'value' }
            });

            const xhr = MockXMLHttpRequest.lastInstance!;
            expect(xhr.headers['X-Custom-Header']).to.equal('value');
        });
    });

    describe('PUT запросы', () => {
        it('должен создавать PUT запрос', () => {
            http.put('/test', { data: { key: 'value' } });

            const xhr = MockXMLHttpRequest.lastInstance!;
            expect(xhr.method).to.equal('PUT');
        });
    });

    describe('DELETE запросы', () => {
        it('должен создавать DELETE запрос', () => {
            http.delete('/test');

            const xhr = MockXMLHttpRequest.lastInstance!;
            expect(xhr.method).to.equal('DELETE');
        });
    });

    describe('повторные попытки', () => {
        it('должен делать несколько попыток при ошибке', async () => {
            let callCount = 0;
            const originalRequest = http.request;

            http.request = () => {
                callCount++;

                if (callCount < 3) {
                    return Promise.reject(new Error('Network error'));
                }
                const xhr = new MockXMLHttpRequest();
                return Promise.resolve(xhr as any);
            };

            try {
                const promise = (http as any).fetchWithRetry('/test', {
                    method: HTTPMethods.GET,
                    tries: 3
                });

                await promise;
                expect(callCount).to.equal(3);
            } finally {
                http.request = originalRequest;
            }
        });

        it('должен бросать ошибку после исчерпания попыток', async () => {
            let callCount = 0;
            const originalRequest = http.request;

            http.request = () => {
                callCount++;
                return Promise.reject(new Error('Network error'));
            };

            try {
                const promise = (http as any).fetchWithRetry('/test', {
                    method: HTTPMethods.GET,
                    tries: 2
                });

                await promise;
                expect.fail('Должна была быть ошибка');
            } catch (error) {
                expect(callCount).to.equal(2);
                expect((error as Error).message).to.equal('Network error');
            } finally {
                http.request = originalRequest;
            }
        });
    });
});
