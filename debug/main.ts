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
  private _valueFn: Function | null = null;
  private _valueFnArgs: any[] = [];
  private static _computeActive: IObservable | null = null;
  private _dependencyArray: IObservable[] = [];

  constructor(init, ...args) {
    if (typeof init === "function") {
      this._valueFn = init;
      this._valueFnArgs = args;
      this.compute();
    } else {
      this._value = init;
    }
  }
  get value() {
    if (
      Observable._computeActive &&
      Observable._computeActive !== this &&
      !Observable._computeActive._dependencyArray.includes(this)
    ) {
      Observable._computeActive._dependencyArray.push(this);
    }
    return this._value;
  }
  set value(newVal) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.publish();
    }
  }
  subscribe = (handler: Function) => {
    if (!this._subscribers.includes(handler)) {
      this._subscribers.push(handler);
    }
  };
  publish = () => {
    for (const handler of this._subscribers) {
      handler(this.value);
    }
  };
  compute = () => {
    Observable._computeActive = this; // catch child observables having their get accessors called and put them on this.
    const result = this._valueFn(...this._valueFnArgs);
    // if (typeof result !== "undefined") {
    //   if (typeof result.then === "function") {
    //     result.then((asyncResult) => (this.value = asyncResult));
    //   } else {
    //     this.value = result;
    //   }
    // }
    Observable._computeActive = null;
    if (result !== this._value) {
      this._dependencyArray.forEach((dependency) => {
        dependency.subscribe(() => this.compute());
      });
      this._dependencyArray = [];
      this.value = result;
    }
  };
  bindComputedObservable = (childObservable: IObservable) => {
    childObservable.subscribe(() => this.compute());
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
  const child = ObservableFactory.create(childFn);
  console.log(`child.value: ${JSON.stringify(child.value, null, 2)}`);

  function parentFn() {
    return child.value + 1;
  }
  const parent = ObservableFactory.create(parentFn);
  console.log(`parent.value: ${JSON.stringify(parent.value, null, 2)}`);

  function grandparentFn() {
    return parent.value + 1;
  }
  const grandparent = ObservableFactory.create(grandparentFn);
  console.log(
    `grandparent.value: ${JSON.stringify(grandparent.value, null, 2)}`
  );

  grandparent.subscribe(function (value) {
    console.log(
      `grandparent update; current value: ${JSON.stringify(value, null, 2)}`
    );
  });
  parent.subscribe(function (value) {
    console.log(
      `parent update; current value: ${JSON.stringify(value, null, 2)}`
    );
  });

  console.log(`child.value = 2`);
  child.value = 2;
}
main();
