import { EventHandler, EventHandlerWithOptions } from '../types/common';
import validateFormFields from '../utils/validateFormFields';
import { router } from '../router';

export const formEvents: Record<string, EventHandler | EventHandlerWithOptions> = {
  blur: {
    handler: (event: Event) => { validateFormFields(event.target); },
    extraEventProps: { capture: true },
  },
  submit: {
    handler: (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      validateFormFields(event.target);
    },
  },
};

export const linkEvents: unknown = {
  click: {
    handler: (event: Event): void => {
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget as HTMLElement;
      const url = target.getAttribute('data-url');
      if (url) {
        router.go(url);
      }
    },
  },
}
