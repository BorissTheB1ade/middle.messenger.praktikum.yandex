import { expect } from 'chai';
import sinon from 'sinon';
import { router } from './Router';
import Block from '../services/Block';

class TestComponent extends Block {
    render(): DocumentFragment {
        const template = document.createElement('template');
        template.innerHTML = '<div>Mock Block</div>';
        return template.content;
    }
}

describe('Router', () => {
    let mockHistory: sinon.SinonStubbedInstance<History>;
    let originalHistory: History;

    beforeEach(() => {
        originalHistory = router['history'];
        
        mockHistory = {
            pushState: sinon.stub(),
            back: sinon.stub(),
            forward: sinon.stub(),
            state: null,
            length: 0,
            go: sinon.stub(),
            replaceState: sinon.stub(),
            scrollRestoration: 'auto'
        } as any;
        
        router['history'] = mockHistory as any;
        
        router['routes'] = [];
        router['currentRoute'] = undefined;
    });

    afterEach(() => {
        router['history'] = originalHistory;
        sinon.restore();
    });

    describe('Методы навигации', () => {
        beforeEach(() => {
            router['routes'] = [];
            router.use('/test', TestComponent);
        });

        it('должен вызывать history.pushState при вызове go()', () => {
            router.go('/test');
            expect(mockHistory.pushState.called).to.be.true;
            expect(mockHistory.pushState.firstCall.args[0]).to.deep.equal({ path: '/test' });
            expect(mockHistory.pushState.firstCall.args[1]).to.equal('Current Page');
            expect(mockHistory.pushState.firstCall.args[2]).to.equal('/test');
        });

        it('должен вызывать history.back() при вызове back()', () => {
            router.back();
            expect(mockHistory.back.called).to.be.true;
        });

        it('должен вызывать history.forward() при вызове forward()', () => {
            router.forward();
            expect(mockHistory.forward.called).to.be.true;
        });

        it('должен вызывать render при переходе на существующий роут', () => {
            const testRoute = router.getRoute('/test');
            const renderSpy = sinon.spy(testRoute!, 'render');
            
            router.go('/test');
            
            expect(renderSpy.called).to.be.true;
        });
    });

    describe('Обработка несуществующих роутов', () => {
    it('должен рендерить /error если роут не существует и error роут зарегистрирован', () => {
        router.use('/error', TestComponent);
        const errorRoute = router.getRoute('/error');
        const renderSpy = sinon.spy(errorRoute!, 'render');
        router.go('/not-found')
        expect(renderSpy.called).to.be.true;
    });

    it('должен переходить на / если error роут не зарегистрирован', () => {
        router.use('/', TestComponent);
        const goSpy = sinon.spy(router, 'go');
        router.go('/not-found');
        expect(goSpy.calledTwice).to.be.true;
        expect(goSpy.getCall(1).args[0]).to.equal('/');
    });
});

    describe('Добавление роутов', () => {
        it('должен добавлять роут через use()', () => {
            router.use('/new', TestComponent);
            const route = router.getRoute('/new');
            expect(route).to.exist;
            expect(route!.match('/new')).to.be.true;
        });

        it('должен поддерживать цепочку вызовов use()', () => {
            const result = router.use('/chain', TestComponent);
            expect(result).to.equal(router);
        });
    });
});
