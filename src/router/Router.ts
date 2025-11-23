import Block from "../services/Block";
import store from "../services/Store";

type RouteProps = {
    rootQuery: string;
    [key: string]: unknown;
};

function isEqual(lhs: any, rhs: any): boolean {
    return lhs === rhs;
}

function render(query: string, block: any): HTMLElement {
    const root = document.querySelector(query) as HTMLElement;
    root.innerHTML = '';
    const content = block.getContent();
    root.appendChild(content);
    return root;
}

class Route {
    private _pathname: string;
    private _blockClass: typeof Block;
    private _block: Block | null;
    private _props: RouteProps;
    private _isProtected: boolean;

    constructor(pathname: string, view: typeof Block, props: RouteProps, isProtected: boolean = false) {
        this._pathname = pathname;
        this._blockClass = view;
        this._block = null;
        this._props = props;
        this._isProtected = isProtected;
    }

    navigate(pathname: string) {
        if (this.match(pathname)) {
            this._pathname = pathname;
            this.render();
        }
    }

    leave() {
        if (this._block) {
            this._block.hide();
        }
    }

    match(pathname: string) {
        return isEqual(pathname, this._pathname);
    }

    isProtected(): boolean {
        return this._isProtected;
    }

    render() {
    if (!this._block) {
      this._block = new this._blockClass('div', this._props);
    }
    render(this._props.rootQuery, this._block);
    this._block.show();
  }
}

export class Router {
    private static __instance: Router;
    private routes!: Route[];
    private history!: History;
    private _currentRoute!: Route | undefined;
    private _rootQuery!: string;

    constructor(rootQuery: string) {
        if (Router.__instance) {
            return Router.__instance;
        }

        this.routes = [];
        this.history = window.history;
        this._currentRoute = undefined;
        this._rootQuery = rootQuery;

        Router.__instance = this;
    }

    use(pathname: string, block: typeof Block, props?: Omit<RouteProps, 'rootQuery'>, isProtected: boolean = false) {
        const route = new Route(pathname, block, {
            rootQuery: this._rootQuery,
            ...props
        }, isProtected);
        this.routes.push(route);
        return this;
    }

    start() {
        window.onpopstate = () => {
            this._onRoute(window.location.pathname);
        };
        this._onRoute(window.location.pathname);
    }

    private _onRoute(pathname: string) {
        const route = this.getRoute(pathname);

        if (!route) {
            const errorRoute = this.getRoute('/error');
            if (errorRoute) {
                this._currentRoute = errorRoute;
                errorRoute.render();
            } else {
                this.go('/');
            }
            return;
        }
        const { isAuth } = store.getState();

        if (route.isProtected() && !isAuth) {
            this.go('/');
            return;
        }

        if (isAuth && (pathname === '/' || pathname === '/sign-up')) {
            this.go('/messenger');
            return;
        }

        if (this._currentRoute && this._currentRoute !== route) {
            this._currentRoute.leave();
        }

        this._currentRoute = route;
        route.render();
    }

    go(pathname: string) {
        this.history.pushState(
            { path: pathname },
            'Current Page',
            pathname
        );
        this._onRoute(pathname);
    }

    back() {
        this.history.back();
    }

    forward() {
        this.history.forward();
    }

    getRoute(pathname: string) {
        return this.routes.find(route => route.match(pathname));
    }
}

export const router = new Router('#app');
