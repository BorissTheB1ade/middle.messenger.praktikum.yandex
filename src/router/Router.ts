import Block from '../services/Block';
import store from '../services/Store';
import Route from './Route';

type RouteProps = {
    rootQuery: string;
    [key: string]: unknown;
};

class Router {
  // eslint-disable-next-line no-use-before-define
  private static instance: Router | null = null;

  private routes: Route[] = [];

  private history: History;

  private currentRoute: Route | undefined;

  private rootQuery: string;

  constructor(rootQuery: string) {
    if (Router.instance) {
      throw new Error('Use Router.getInstance() instead of new Router()');
    }

    this.routes = [];
    this.history = window.history;
    this.currentRoute = undefined;
    this.rootQuery = rootQuery;

    Router.instance = this;
  }

  public static getInstance(rootQuery: string = '#app'): Router {
    if (!Router.instance) {
      Router.instance = new Router(rootQuery);
    }
    return Router.instance;
  }

  use(pathname: string, block: typeof Block, props?: Omit<RouteProps, 'rootQuery'>, isProtected: boolean = false) {
    const route = new Route(pathname, block, {
      rootQuery: this.rootQuery,
      ...props,
    }, isProtected);
    this.routes.push(route);
    return this;
  }

  start() {
    window.onpopstate = () => {
      this.onRoute(window.location.pathname);
    };
    this.onRoute(window.location.pathname);
  }

  private onRoute(pathname: string) {
    const route = this.getRoute(pathname);

    if (!route) {
      const errorRoute = this.getRoute('/error');
      if (errorRoute) {
        this.currentRoute = errorRoute;
        errorRoute.render();
      } else {
        this.go('/');
      }
      return;
    }

    const { isAuth } = store.getState();

    if (route.isRouteProtected() && !isAuth) {
      this.go('/');
      return;
    }

    if (isAuth && (pathname === '/' || pathname === '/sign-up')) {
      this.go('/messenger');
      return;
    }

    if (this.currentRoute && this.currentRoute !== route) {
      this.currentRoute.leave();
    }

    this.currentRoute = route;
    route.render();
  }

  go(pathname: string) {
    this.history.pushState(
      { path: pathname },
      'Current Page',
      pathname,
    );
    this.onRoute(pathname);
  }

  back() {
    this.history.back();
  }

  forward() {
    this.history.forward();
  }

  getRoute(pathname: string) {
    return this.routes.find((route) => route.match(pathname));
  }
}

const router = Router.getInstance('#app');

export { Router, router };
