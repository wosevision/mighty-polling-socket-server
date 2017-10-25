export class DomBuddy {
  /**
   * PUBLIC METHODS
   */
  addClass(what) {
    return {
      to: this._to(it => it.classList.add(what))
    };
  }
  removeClass(what) {
    return {
      from: this._to(it => it.classList.remove(what))
    };
  }
  prepend(what) {
    return {
      to: this._to(it => it.insertAdjacentHTML('afterbegin', this._normalize(what))),
      before: this._to(it => it.insertAdjacentHTML('beforebegin', this._normalize(what)))
    };
  }
  append(what) {
    return {
      to: this._to(it => it.insertAdjacentHTML('beforeend', this._normalize(what))),
      after: this._to(it => it.insertAdjacentHTML('afterend', this._normalize(what)))
    };
  }
  clear(what) {
    return this._to(it => it.innerHTML = '')(what);
  }

  /**
   * PRIVATE METHODS
   */
  _to(how) {
    return what => {
      const to = this._normalize(what, false);
      [...to].forEach(it => how(it))
      return { then: this };
    };
  }
  _normalize(what, toString = true) {
    if (what instanceof NodeList) return toString
      ? [...what].map(it => (<HTMLElement>it).outerHTML).join('\n')
      : [...what]
    else if (what instanceof Node) return toString
      ? (<HTMLElement>what).outerHTML
      : [what]
    else if (typeof what === 'string') return toString
      ? what
      : document.querySelectorAll(what)
    else throw new Error(`DomBuddy was provided with an invalid value of ${what}`);
  }
}