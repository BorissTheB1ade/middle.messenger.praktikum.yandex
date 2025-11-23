import Block from '../services/Block';

type RouteProps = {
  rootQuery: string;
  [key: string]: unknown;
};

function isEqual(lhs: string, rhs: string): boolean {
  return lhs === rhs;
}

function render(query: string, block: Block): HTMLElement {
  const root = document.querySelector(query) as HTMLElement;
  if (!root) {
    throw new Error(`Root element with query "${query}" not found`);
  }

  root.innerHTML = '';
  const content = block.getContent();
  root.appendChild(content);
  return root;
}

class Route {
  private pathname: string;

  private BlockClass: typeof Block;

  private block: Block | null;

  private props: RouteProps;

  private isProtected: boolean;

  constructor(pathname: string, view: typeof Block, props: RouteProps, isProtected: boolean = false) {
    this.pathname = pathname;
    this.BlockClass = view;
    this.block = null;
    this.props = props;
    this.isProtected = isProtected;
  }

  navigate(pathname: string) {
    if (this.match(pathname)) {
      this.pathname = pathname;
      this.render();
    }
  }

  leave() {
    if (this.block) {
      this.block.hide();
    }
  }

  match(pathname: string) {
    return isEqual(pathname, this.pathname);
  }

  isRouteProtected(): boolean {
    return this.isProtected;
  }

  render() {
    if (!this.block) {
      this.block = new this.BlockClass('div', this.props);
    }

    if (this.block) {
      render(this.props.rootQuery, this.block);
      this.block.show();
    }
  }
}

export default Route;
