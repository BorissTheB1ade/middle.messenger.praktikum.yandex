import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = global.window.document;
global.HTMLElement = global.window.HTMLElement;
global.HTMLDivElement = global.window.HTMLDivElement;
global.HTMLTemplateElement = global.window.HTMLTemplateElement;
global.DocumentFragment = global.window.DocumentFragment;
global.Event = global.window.Event;
global.MouseEvent = global.window.MouseEvent;
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

global.store = {
  getState: () => ({ isAuth: false }),
  dispatch: () => {},
  subscribe: () => {}
};
