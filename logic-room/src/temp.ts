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
    } else {
      this._value = init;
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
  const childObservable = new Observable(1);
  const parentObservable = new Observable(() => childObservable.value + 1);
  parentObservable.subscribe((val) =>
    console.log(`parentObservable newValue: ${JSON.stringify(val, null, 2)}`)
  );
  console.log(
    `childObservable current value: ${JSON.stringify(childObservable.value)}`
  );
  console.log(
    `parentObservable current value: ${JSON.stringify(parentObservable.value)}`
  );
  console.log("setting childObservable.value to 2 (from 1)");

  childObservable.value = 2;
};
main();
