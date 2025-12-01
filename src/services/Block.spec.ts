import { expect } from 'chai';
import Block from './Block';
import EventBus from './EventBus';

class TestComponent extends Block {
    render() {
        return this.compile('<div>Test</div>', {});
    }
}

describe('Базовый класс Block', () => {
    describe('Создание инстанса', () => {
        it('должен создавать инстанс с тегом по умолчанию', () => {
            const component = new TestComponent();
            expect(component).to.be.instanceOf(Block);
            expect(component.element.tagName).to.equal('DIV');
        });

        it('должен создавать инстанс с кастомным тегом', () => {
            const component = new TestComponent('span');
            expect(component.element.tagName).to.equal('SPAN');
        });

        it('должен иметь уникальный id', () => {
            const component1 = new TestComponent();
            const component2 = new TestComponent();
            expect(component1['_id']).to.not.equal(component2['_id']);
        });

        it('должен принимать props и children', () => {
            const childComponent = new TestComponent();
            const component = new TestComponent('div', {
                testProp: 'value',
                child: childComponent
            });
            expect(component.element).to.exist;
        });
    });

    describe('Работа с props', () => {
        it('должен обновлять props через setProps', () => {
            const component = new TestComponent();
            component.setProps({ newProp: 'newValue' });
            expect(component.element).to.exist;
        });

        it('не должен обновляться если props не изменились', () => {
            const component = new TestComponent('div', { prop: 'value' });
            const oldElement = component.element;
            component.setProps({ prop: 'value' });
            expect(component.element).to.equal(oldElement);
        });

        it('должен правильно разделять props, children и lists через getChildren', () => {
            const child1 = new TestComponent();
            const child2 = new TestComponent();
            const testData = {
                text: 'Hello',
                count: 42,
                child: child1,
                items: [child2, 'not a block'],
                list: [1, 2, 3]
            };
            const component = new TestComponent();
            const getChildrenMethod = (component as unknown as {
                getChildren: (data: Record<string, unknown>) => {
                    props: Record<string, unknown>;
                    childs: Record<string, Block>;
                    lists: Record<string, unknown[]>;
                }
            }).getChildren;
            const result = getChildrenMethod.call(component, testData);
            expect(result.props).to.deep.equal({
                text: 'Hello',
                count: 42
            });
            expect(result.childs).to.have.property('child');
            expect(result.childs.child).to.equal(child1);
            expect(result.lists).to.have.property('items');
            expect(result.lists.items).to.include(child2);
            expect(result.lists.items).to.include('not a block');
            expect(result.lists).to.have.property('list');
            expect(result.lists.list).to.deep.equal([1, 2, 3]);
        });
    });

    describe('Методы жизненного цикла', () => {
        it('должен вызывать componentDidMount при dispatchComponentDidMount', () => {
            let mountCalled = false;
            class MountTestComponent extends TestComponent {
                componentDidMount() {
                    mountCalled = true;
                }
            }
            const component = new MountTestComponent();
            component.dispatchComponentDidMount();
            expect(mountCalled).to.be.true;
        });

        it('должен вызывать componentDidUpdate при изменении props', () => {
            let updateCalled = false;
            let oldPropsValue: unknown = null;
            let newPropsValue: unknown = null;
            class UpdateTestComponent extends TestComponent {
                componentDidUpdate(oldProps: unknown, newProps: unknown): boolean {
                    updateCalled = true;
                    oldPropsValue = oldProps;
                    newPropsValue = newProps;
                    return true;
                }
            }
            const component = new UpdateTestComponent();
            component.setProps({ test: 'new' });
            expect(updateCalled).to.be.true;
            expect(oldPropsValue).to.not.be.null;
            expect(newPropsValue).to.not.be.null;
        });
    });

    describe('Работа с DOM', () => {
        it('должен возвращать HTMLElement через getContent', () => {
            const component = new TestComponent();
            const content = component.getContent();
            expect(content).to.be.instanceOf(HTMLElement);
            expect(content.tagName).to.equal('DIV');
        });

        it('должен показывать и скрывать элемент', () => {
            const component = new TestComponent();
            component.show();
            expect(component.element.style.display).to.equal('block');
            component.hide();
            expect(component.element.style.display).to.equal('none');
        });

        it('должен добавлять события в props', () => {
            const clickHandler = () => { };
            const mouseoverHandler = () => { };
            const component = new TestComponent('div', {
                events: {
                    click: clickHandler,
                    mouseover: mouseoverHandler
                }
            });
            const props = component['_props'] as { events?: Record<string, unknown> };
            expect(props.events).to.exist;
            expect(props.events).to.have.property('click');
            expect(props.events).to.have.property('mouseover');
            expect(props.events!.click).to.equal(clickHandler);
            expect(props.events!.mouseover).to.equal(mouseoverHandler);
        });

        it('должен обновлять события через setProps', () => {
            const handler1 = () => { };
            const handler2 = () => { };
            const component = new TestComponent('div', {
                events: { click: handler1 }
            });
            component.setProps({ events: { click: handler2 } });
            const props = component['_props'] as { events?: Record<string, unknown> };
            expect(props.events!.click).to.equal(handler2);
            expect(props.events!.click).to.not.equal(handler1);
        });

        it('должен добавлять атрибуты', () => {
            const component = new TestComponent('div', {
                attributes: {
                    'data-test': 'value',
                    'class': 'test-class'
                }
            });
            expect(component.element.getAttribute('data-test')).to.equal('value');
            expect(component.element.getAttribute('class')).to.equal('test-class');
        });
    });

    describe('Метод compile', () => {
        it('должен компилировать шаблон с children', () => {
            const child = new TestComponent();
            const component = new TestComponent('div', { child });
            const template = '<div>{{child}}</div>';
            const result = component.compile(template, {});
            expect(result).to.be.instanceOf(DocumentFragment);
        });

        it('должен заменять stubs на реальные элементы при наличии children', () => {
            const child = new TestComponent();
            const component = new TestComponent('div', { child });
            const template = '<div>{{child}}</div>';
            const result = component.compile(template, {});
            expect(result.children.length).to.be.greaterThan(0);
            const div = result.querySelector('div');
            expect(div).to.exist;
        });

        it('должен обрабатывать lists в шаблонах', () => {
            const child1 = new TestComponent();
            const child2 = new TestComponent();
            const component = new TestComponent('div', {
                items: [child1, child2]
            });
            const template = '<div>{{items}}</div>';
            const result = component.compile(template, {});
            expect(result.children.length).to.be.greaterThan(0);
            expect(result).to.be.instanceOf(DocumentFragment);
        });

        it('должен возвращать DocumentFragment', () => {
            const component = new TestComponent();
            const template = '<div>test</div>';
            const result = component.compile(template, {});
            expect(result).to.be.instanceOf(DocumentFragment);
        });
    });

    describe('Проксирование props', () => {
        it('должен запрещать доступ к приватным полям через proxy', () => {
            const component = new TestComponent('div', { test: 'value' });
            const propsProxy = component['_props'];
            expect(() => {
                (propsProxy as any)._privateField;
            }).to.throw('нет доступа');
            expect(() => {
                (propsProxy as any)._privateField = 'test';
            }).to.throw('нет доступа');
        });

        it('должен вызывать обновление при изменении через proxy', () => {
            let updateTriggered = false;
            class ProxyTestComponent extends TestComponent {
                componentDidUpdate(): boolean {
                    updateTriggered = true;
                    return true;
                }
            }
            new ProxyTestComponent('div', { test: 'value' });
            expect(updateTriggered).to.be.false;
        });
    });

    describe('Работа с EventBus', () => {
        it('должен создавать внутренний EventBus', () => {
            const component = new TestComponent();
            expect(component['_eventBus']).to.be.instanceOf(EventBus);
        });

        it('должен подписываться на события жизненного цикла', () => {
            const component = new TestComponent();
            const eventBus = component['_eventBus'];
            const listeners = (eventBus as any).listeners;
            expect(listeners.init).to.exist;
            expect(listeners['flow:component-did-mount']).to.exist;
            expect(listeners['flow:render']).to.exist;
        });
    });
});
