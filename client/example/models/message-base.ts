export class MessageBase {
  private static months = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];
  protected formatDate?(dateString) {
    const date = new Date(dateString);
    return [
      MessageBase.months[date.getMonth()],
      ' ', date.getDate(),
      ', ', date.getFullYear(),
      ' ', this.leadingZero(date.getHours()),
      ':', this.leadingZero(date.getMinutes())
    ].join('');
  }
  protected leadingZero?(number) {
    return number < 10 ? `0${number}` : number;
  }
  protected pluck?(obj, props) {
    // return Object.assign({}, ...props.map(prop => ({[prop]: obj[prop]})));
    return props.reduce((result, key) => { result[key] = obj[key]; return result; }, {});
  }
}