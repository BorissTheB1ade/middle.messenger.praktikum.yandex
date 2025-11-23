import { router } from './router/index';

export default class App {

  constructor() {
    this.init();
  }

  async init() {
    router.start();
  }

  render() { }
}

export const app = new App();
