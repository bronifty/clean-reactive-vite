class Observable {
  private _value;
  private _subscribers = [];
  private _valueFunction;
  private _valueFunctionArgs;
  static _computeActive;
  static _childObservables = [];
  constructor(init, ...args) {
    if (typeof init === "function") {
      this._valueFunction = init;
      this._valueFunctionArgs = args;
      Observable._computeActive = true;
      this.compute();
      Observable._computeActive = false;
      Observable._childObservables.forEach((obs) => {
        obs.subscribe(() => this.compute());
      });
    }
  }
  get value() {
    if (Observable._computeActive) {
      if (!Observable._childObservables.includes(this)) {
        Observable._childObservables.push(this);
      }
    }
    return this._value;
  }
  set value(newVal) {
    this._value = newVal;
    this.publish();
  }
  subscribe = (handler) => {
    this._subscribers.push(handler);
  };
  publish = () => {
    for (const sub of this._subscribers) {
      sub(this.value);
    }
  };

  compute = () => {
    const result = this._valueFunction(...this._valueFunctionArgs);
    if (typeof result !== "undefined") {
      if (typeof result.then === "function") {
        result.then((asyncResult) => (this.value = asyncResult));
      } else {
        this.value = result;
      }
    }
  };
}

const main = () => {
  const o1 = new Observable(1);
  const o2 = new Observable(() => o1.value + 1);
  o2.subscribe((val) =>
    console.log(`subscriber to o2 changes; ${JSON.stringify(val, null, 2)}`)
  );
  console.log(`o1 current value: ${JSON.stringify(o1.value)}`);
  console.log(`o2 current value: ${JSON.stringify(o2.value)}`);
  o1.value = 2;
};
main();
