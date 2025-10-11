import Handlebars from 'handlebars';
import { EventHandler, EventHandlerWithOptions } from 'types/common';
import EventBus from './EventBus';
import generateRandomString from '../utils/generateRandomString';

type BlockProps = {
  events?: Record<string, EventHandler | EventHandlerWithOptions>;
  attributes?: Record<string, string>;
  [key: string]: unknown;
};
// eslint-disable-next-line no-use-before-define
type BlockChild = Block | Block[];
type BlockChildren = Record<string, BlockChild>;
type BlockLists = Record<string, unknown[]>;

export default class Block {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  _element!: HTMLElement;

  _meta: {
    tagName: string;
    props: BlockProps;
  };

  _id: string;

  _props: BlockProps;

  _eventBus: EventBus;

  _childs: BlockChildren;

  _lists: BlockLists;

  _setUpdate: boolean = false;

  constructor(tagName: string = 'div', propsAndChilds: Record<string, unknown> = {}) {
    const { childs, props, lists } = this.getChildren(propsAndChilds);
    this._meta = { tagName, props };
    this._id = generateRandomString();
    this._props = this._makePropsProxy(props);
    this._childs = this._makePropsProxy(childs);
    this._lists = this._makePropsProxy(lists);
    this._eventBus = new EventBus();

    this._registerEvents();
    this._eventBus.emit(Block.EVENTS.INIT);
  }

  _registerEvents(): void {
    this._eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    this._eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    this._eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    this._eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  // eslint-disable-next-line class-methods-use-this
  _createDocumentElement(tagName: string): HTMLElement {
    const el = document.createElement(tagName);
    return el;
  }

  init(): void {
    this._element = this._createDocumentElement(this._meta.tagName);
    this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  _render(): void {
    try {
      const block = this.render();
      this.deleteEvents();
      this._element.innerHTML = '';
      this._element.appendChild(block);
      this.addAttribute();
      this.addEvents();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Render error:', e);
      throw e;
    }
  }

  render(): DocumentFragment {
    return this.compile('<div id="appTETET"></div>', {});
  }

  addEvents(): void {
    const { events = {} } = this._props;
    Object.keys(events).forEach((eventKey) => {
      const eventHandler = events[eventKey];
      if (typeof eventHandler === 'object' && 'handler' in eventHandler) {
        if (eventHandler.extraEventProps) {
          this._element.addEventListener(eventKey, eventHandler.handler, eventHandler.extraEventProps);
        } else {
          this._element.addEventListener(eventKey, eventHandler.handler);
        }
      } else if (typeof eventHandler === 'function') {
        this._element.addEventListener(eventKey, eventHandler);
      }
    });
  }

  deleteEvents(): void {
    const { events = {} } = this._props;
    Object.keys(events).forEach((eventKey) => {
      const eventHandler = events[eventKey];
      if (typeof eventHandler === 'object' && 'handler' in eventHandler) {
        this._element.removeEventListener(eventKey, eventHandler.handler);
      } else if (typeof eventHandler === 'function') {
        this._element.removeEventListener(eventKey, eventHandler);
      }
    });
  }

  addAttribute(): void {
    const { attributes = {} } = this._props;
    Object.entries(attributes).forEach(([attrKey, attrValue]) => {
      if (typeof attrValue === 'string') {
        this._element.setAttribute(attrKey, attrValue);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getChildren(propsAndChilds: Record<string, unknown>): {
    props: BlockProps;
    childs: BlockChildren;
    lists: BlockLists;
  } {
    const childs: BlockChildren = {};
    const props: BlockProps = {};
    const lists: BlockLists = {};

    Object.entries(propsAndChilds).forEach(([key, value]) => {
      if (value instanceof Block) {
        childs[key] = value;
      } else if (Array.isArray(value)) {
        lists[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { props, childs, lists };
  }

  compile(template: string, props: Record<string, unknown> = {}): DocumentFragment {
    const propsAndStubs: Record<string, unknown> = { ...props };

    Object.entries(this._childs).forEach(([key, child]) => {
      if (child instanceof Block) {
        propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
      }
    });

    Object.keys(this._lists).forEach((key) => {
      propsAndStubs[key] = `<div data-id="__l_${key}"></div>`;
    });

    const fragment = this._createDocumentElement('template') as HTMLTemplateElement;
    fragment.innerHTML = Handlebars.compile(template)(propsAndStubs);

    Object.values(this._childs).forEach((child) => {
      if (child instanceof Block) {
        const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
        if (stub) {
          stub.replaceWith(child.getContent());
        }
      }
    });

    Object.entries(this._lists).forEach(([key, list]) => {
      const stub = fragment.content.querySelector(`[data-id="__l_${key}"]`);
      if (!stub) return;

      const listContent = this._createDocumentElement('template') as HTMLTemplateElement;
      list.forEach((listItem: unknown) => {
        if (listItem instanceof Block) {
          listContent.content.append(listItem.getContent());
        }
      });
      stub.replaceWith(listContent.content);
    });

    return fragment.content;
  }

  _componentDidMount(): void {
    this.componentDidMount();
    Object.values(this._childs).forEach((child) => {
      if (child instanceof Block) {
        child.dispatchComponentDidMount();
      }
    });
  }

  componentDidMount(): void { }

  dispatchComponentDidMount(): void {
    this._eventBus.emit(Block.EVENTS.FLOW_CDM);
    if (Object.keys(this._childs).length) {
      this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  _componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (response) {
      this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): boolean {
    return JSON.stringify(oldProps) !== JSON.stringify(newProps);
  }

  setProps = (nextProps: Record<string, unknown>): void => {
    if (!nextProps) {
      return;
    }
    const oldProps = { ...this._props };
    const { childs, props, lists } = this.getChildren(nextProps);

    Object.assign(this._props, props);
    Object.assign(this._childs, childs);
    Object.assign(this._lists, lists);

    this._eventBus.emit(Block.EVENTS.FLOW_CDU, oldProps, this._props);
  };

  get element(): HTMLElement {
    return this._element;
  }

  getContent(): HTMLElement {
    return this.element;
  }

  _makePropsProxy<T extends object>(props: T): T {
    return new Proxy(props, {
      get: (target: T, prop: string | symbol): unknown => {
        if (typeof prop === 'string' && prop.startsWith('_')) {
          throw new Error('нет доступа');
        }
        const value = (target as Record<string, unknown>)[prop as string];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target: T, prop: string | symbol, value: unknown): boolean => {
        if (typeof prop === 'string' && prop.startsWith('_')) {
          throw new Error('нет доступа');
        }
        const currentValue = (target as Record<string, unknown>)[prop as string];
        if (currentValue === value) return true;

        const oldProps = { ...target };
        // eslint-disable-next-line no-param-reassign
        (target as Record<string, unknown>)[prop as string] = value;

        if (typeof prop === 'string') {
          this._eventBus.emit(Block.EVENTS.FLOW_CDU, oldProps, target);
        }

        return true;
      },
    });
  }

  show(): void {
    this._element.style.display = 'block';
  }

  hide(): void {
    this._element.style.display = 'none';
  }
}
