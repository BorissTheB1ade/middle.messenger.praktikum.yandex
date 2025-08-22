export type EventHandler = (event: Event) => void;

export type EventHandlerWithOptions = {
  handler: EventHandler;
  extraEventProps?: boolean | AddEventListenerOptions;
};
