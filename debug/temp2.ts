class Observable {
  private _value: any;
  private _subscribers: Function[] = [];
  private _valueFunction: Function | null = null;
  private _valueFunctionArgs: any[] = [];
  static _computeActive: Observable | null = null;

  constructor(init: any, ...args: any[]) {
    if (typeof init === "function") {
      this._valueFunction = init;
      this._valueFunctionArgs = args;
      Observable._computeActive = this;
      this.compute();
      Observable._computeActive = null;
    } else {
      this._value = init;
    }
  }

  get value() {
    if (Observable._computeActive) {
      this.subscribe(() => Observable._computeActive?.compute());
    }
    return this._value;
  }

  set value(newVal: any) {
    this._value = newVal;
    this.publish();
  }

  subscribe(handler: Function) {
    this._subscribers.push(handler);
  }

  publish() {
    for (const sub of this._subscribers) {
      sub(this.value);
    }
  }

  compute() {
    if (this._valueFunction) {
      const result = this._valueFunction(...this._valueFunctionArgs);
      if (typeof result !== "undefined") {
        if (result instanceof Promise) {
          result.then((asyncResult) => (this.value = asyncResult));
        } else {
          this.value = result;
        }
      }
    }
  }
}

// Create a new observable with an initial value of 10
const childObservable = new Observable(10);

// Create a new computed observable based on the child observable
const parentObservable = new Observable(() => childObservable.value * 2);

// Subscribe to changes for both observables
childObservable.subscribe((value) => console.log(`Child updated to: ${value}`));
parentObservable.subscribe((value) =>
  console.log(`Parent updated to: ${value}`)
);

// Update the child observable's value
console.log("Changing childObservable value to 15");
childObservable.value = 15; // This should trigger recomputation of parentObservable and print logs
