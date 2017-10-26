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

  notify(message: string, options: NotificationOptions = {}) {
    this._options = options;
    const notification = this._transitionIn(message);
    if (options.duration) {
      setTimeout(() => {
        this._transitionOut(notification);
      }, options.duration);
    }
    return this;
  }

  dismiss() {

  }

  private _transitionIn(message) {
    const notificationClasses = this._getNotificationClasses(this._options);
    if (!this._options.disableAnimation) {
      notificationClasses.push('animated', 'fadeInDown');
    }
    const template = document.createElement('template');
    template.innerHTML = `<div data-closable class="callout alert-callout ${notificationClasses.join(' ')}">
      ${message}
      <button class="close-button" aria-label="Dismiss alert" type="button" data-close>
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    const notification = template.content.firstChild;
    document.body.appendChild(notification);
    this._options.onNotify && this._options.onNotify.apply(notification);
    return notification;
  }

  private _transitionOut(notification) {
    if (this._options.disableAnimation) {
      document.body.removeChild(notification);
      this._options.onDismiss && this._options.onDismiss.apply(notification);
    } else {
      notification.classList.remove('fadeInDown');
      notification.classList.add('fadeOutUp');
      setTimeout(() => {
        document.body.removeChild(notification);
        this._options.onDismiss && this._options.onDismiss.apply(notification);
      }, 1000);
    }
  }

  private _getNotificationClasses(options) {
    const notificationClasses = ['notification'];
    if (options.position) {
      Object.keys(options.position).forEach(key => {
          options.position[key] && notificationClasses.push(`notification-${key}`);
      });
    }
    if (options.className) {
      notificationClasses.push(options.className)
    }
    return notificationClasses;
  }
}