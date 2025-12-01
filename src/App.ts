import router from './router/index';

export default class App {
  constructor() {
    App.init();
  }

  private static init(): void {
    router.start();
  }

  render() { }
}

export const app = new App();
