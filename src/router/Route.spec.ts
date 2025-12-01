import { expect } from 'chai';
import Route from './Route';
import Block from '../services/Block';

class TestComponent extends Block {
  render() {
    return this.compile('<div>Mock Block</div>', {});
  }
  show() {
    this.element.style.display = 'block';
  }
  hide() {
    this.element.style.display = 'none';
  }
}

describe('Route', () => {
  let route: Route;

  beforeEach(() => {

    if (!document.querySelector('#app')) {
      const app = document.createElement('div');
      app.id = 'app';
      document.body.appendChild(app);
    }

    route = new Route('/test', TestComponent, { rootQuery: '#app' });
  });

  afterEach(() => {
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = '';
    }
  });

  describe('constructor', () => {
    it('должен создавать инстанс Route с правильными параметрами', () => {
      expect(route).to.be.instanceOf(Route);
      expect(route['pathname']).to.equal('/test');
      expect(route['BlockClass']).to.equal(TestComponent);
      expect(route['props']).to.deep.equal({ rootQuery: '#app' });
    });

    it('должен создавать инстанс Route с защищенным маршрутом', () => {
      const protectedRoute = new Route('/protected', TestComponent, { rootQuery: '#app' }, true);
      expect(protectedRoute.isRouteProtected()).to.be.true;
    });
  });

  describe('match', () => {
    it('должен возвращать true для совпадающего pathname', () => {
      expect(route.match('/test')).to.be.true;
    });

    it('должен возвращать false для несовпадающего pathname', () => {
      expect(route.match('/wrong')).to.be.false;
    });
  });

  describe('navigate', () => {
    it('должен вызывать render при совпадении', () => {
      let renderCalled = false;
      const originalRender = route.render;
      route.render = () => {
        renderCalled = true;
      };
      route.navigate('/test');
      expect(renderCalled).to.be.true;
      route.render = originalRender;
    });

    it('не должен обновлять pathname при несовпадении', () => {
      const originalPathname = route['pathname'];
      route.navigate('/wrong');
      expect(route['pathname']).to.equal(originalPathname);
    });
  });

  describe('render', () => {
    it('должен создавать блок при первом рендере', () => {
      expect(route['block']).to.be.null;
      route.render();
      expect(route['block']).to.not.be.null;
      expect(route['block']).to.be.instanceOf(TestComponent);
    });

    it('должен добавлять блок в DOM', () => {
      route.render();
      const appElement = document.querySelector('#app');
      expect(appElement?.innerHTML).to.contain('<div>Mock Block</div>');
    });
  });

  describe('leave', () => {
    it('должен вызывать hide у блока', () => {
      route.render();
      const block = route['block'];
      if (block) {
        let hideCalled = false;
        const originalHide = block.hide;
        block.hide = () => {
          hideCalled = true;
        };
        route.leave();
        expect(hideCalled).to.be.true;
        block.hide = originalHide;
      }
    });

    it('не должен падать если блок не создан', () => {
      expect(() => route.leave()).not.to.throw();
    });
  });

  describe('isRouteProtected', () => {
    it('должен возвращать true для защищенного маршрута', () => {
      const protectedRoute = new Route('/protected', TestComponent, { rootQuery: '#app' }, true);
      expect(protectedRoute.isRouteProtected()).to.be.true;
    });

    it('должен возвращать false для незащищенного маршрута', () => {
      expect(route.isRouteProtected()).to.be.false;
    });
  });
});
