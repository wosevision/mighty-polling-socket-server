import '../styles/notification.scss';

export class Notification {
  notify(message: string, options: Partial<{
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
  }> = {}) {
    const notification = this._transitionIn(message, options);
    options.onNotify && options.onNotify.apply(notification);
    if (options.duration) {
      setTimeout(() => {
        this._transitionOut(notification, options);
        options.onDismiss && options.onDismiss.apply(notification);
      }, options.duration);
    }
    return this;
  }

  dismiss() {

  }

  private _transitionIn(message, options) {
    const notificationClasses = this._getNotificationClasses(options);
    if (!options.disableAnimation) {
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
    return notification;
  }

  private _transitionOut(notification, options) {
    if (options.disableAnimation) {
      document.body.removeChild(notification)
    } else {
      notification.classList.remove('fadeInDown');
      notification.classList.add('fadeOutUp');
      setTimeout(() => document.body.removeChild(notification), 3000);
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