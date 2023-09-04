export interface IObservable {
  value: any;
  subscribe(handler: Function): void;
  push(item: any): void;
  publish(): void;
  compute(): void;
}
export class Observable {
  private _value: any;
  private _subscribers: Function[] = [];
  private _valueFunction: Function | null = null;
  private _valueFunctionArgs: any[] = [];
  static _computeActive: IObservable | null = null;
  static _childObservables: IObservable[] = [];
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
  subscribe = (handler: Function) => {
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
  push = (item) => {
    if (Array.isArray(this._value)) {
      this._value.push(item);
    } else {
      throw new Error("Push can only be called on an observable array.");
    }
  };
}

export class ObservableFactory {
  static create(initialValue: any, ...args: any[]): IObservable {
    return new Observable(initialValue, ...args);
  }
}

function main() {
  function childFn() {
    return 1;
  }
  const childO = ObservableFactory.create(childFn);
  console.log(`childO.value: ${JSON.stringify(childO.value, null, 2)}`);

  function parentFn() {
    return childO.value + 1;
  }
  const parentO = ObservableFactory.create(parentFn);
  console.log(`parentO.value: ${JSON.stringify(parentO.value, null, 2)}`);

  parentO.subscribe(function (value) {
    console.log(
      `parentO subscriber; parentO value: ${JSON.stringify(value, null, 2)}`
    );
  });

  childO.value = 2;
}
main();
