import Block from 'services/Block';

export default function renderDOM(query: string, component: Block): Element {
  const root = document.querySelector(query);

  if (!root) {
    throw new Error('root element not found');
  }

  root.appendChild(component.getContent());
  component.dispatchComponentDidMount();
  return root;
}
