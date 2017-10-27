import '../styles/notification.scss';

export type NotificationOptions = Partial<{
  duration: number,
  className: string,
  countdown: boolean,
  position: Partial<{
    left: boolean,
    right: boolean,
    top: boolean,
    bottom: boolean
  }>,
  disableAnimation: boolean,
  onNotify(): void,
  onDismiss(): void
}>;

export class Notification {
  private _options: NotificationOptions;
  private _notification: Element;

  constructor(private _defaults: NotificationOptions = {}) { }

  notify(message: string, options: NotificationOptions = {}) {
    this._options = {...this._defaults, ...options};
    this._notification = this._getNotification(message);
    this._transitionIn();
    if (this._options.duration) {
      setTimeout(() => {
        this._transitionOut();
      }, this._options.duration);
    }
    return this;
  }

  dismiss() {
    this._transitionOut();
  }

  private _getNotification(message: string) {
    const notificationClasses = this._getNotificationClasses();
    const template = document.createElement('template');
    template.innerHTML = `<div data-closable class="callout alert-callout ${notificationClasses}">
      ${message}
      <button class="close-button" aria-label="Dismiss alert" type="button" data-close>
        <span aria-hidden="true">⊗</span>
      </button>
    </div>`;
    return template.content.firstChild as Element;
  }

  private _transitionIn() {
    if (this._options.disableAnimation) {
      document.body.appendChild(this._notification);
      this._options.onNotify && this._options.onNotify.apply(this._notification);
    } else {
      this._notification.classList.remove('fadeOutUp');
      this._notification.classList.add('fadeInDown');
      document.body.appendChild(this._notification);
      setTimeout(() => {
        this._options.onNotify && this._options.onNotify.apply(this._notification);
      }, 1000);
    }
  }

  private _transitionOut() {
    if (this._options.disableAnimation) {
      document.body.removeChild(this._notification);
      this._options.onDismiss && this._options.onDismiss.apply(this._notification);
    } else {
      this._notification.classList.remove('fadeInDown');
      this._notification.classList.add('fadeOutUp');
      setTimeout(() => {
        document.body.removeChild(this._notification);
        this._options.onDismiss && this._options.onDismiss.apply(this._notification);
      }, 1000);
    }
  }

  private _getNotificationClasses() {
    const notificationClasses = ['notification'];
    this._options.position && Object.keys(this._options.position).forEach(key => {
      this._options.position[key] && notificationClasses.push(`notification-${key}`);
    });
    this._options.className && notificationClasses.push(this._options.className);
    !this._options.disableAnimation && notificationClasses.push('animated');
    return notificationClasses.join(' ');
  }
}