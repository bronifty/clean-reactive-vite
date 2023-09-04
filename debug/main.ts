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
  private _isComputing: boolean = false;
  // private _computeActive: IObservable | null = null;
  private static _childObservables: IObservable[] = [];
  constructor(init, ...args) {
    if (typeof init === "function") {
      this._valueFn = init;
      this._valueFnArgs = args;

      this.compute(); // assign this._valueFn(...this._valueFnArgs) to this._value
    } else {
      this._value = init;
    }
  }
  get value() {
    if (Observable._computeActive && Observable._computeActive !== this) {
      const activeObservable = Observable._computeActive;
      if (!activeObservable._dependencyArray.includes(this)) {
        activeObservable._dependencyArray.push(this);
      }
      return this._value;
    }
    return this._value;
  }

  // get value() {
  //   console.log(`in ${JSON.stringify(this, null, 2)} getter`);
  //   if (Observable._computeActive) {
  //     console.log("compute active");
  //     console.log(
  //       `what is the this value of what is being accessed? ${JSON.stringify(
  //         this,
  //         null,
  //         2
  //       )}`
  //     );
  //     // this.bindComputedObservable(this);

  //     // if (!this._childObservables.includes(this)) {
  //     //   console.log("adding self to child observables");
  //     //   this._childObservables.push(this);
  //     // }
  //   }
  //   return this._value;
  // }
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
    if (this._isComputing) {
      return;
    }
    this._isComputing = true;
    Observable._computeActive = this; // catch child observables having their get accessors called and put them on this._childObservables subscription dependencies array
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
    this._isComputing = false;

    // this._childObservables.forEach((obs) => {
    //   obs.subscribe(() => this.compute());
    // });
    // console.log(
    //   `in ${JSON.stringify(
    //     this,
    //     null,
    //     2
    //   )} compute assigning ${result} to this.value`
    // );
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
  const childO = ObservableFactory.create(childFn);
  console.log(`childO.value: ${JSON.stringify(childO.value, null, 2)}`);

  function parentFn() {
    return childO.value + 1;
  }
  const parentO = ObservableFactory.create(parentFn);
  console.log(`parentO.value: ${JSON.stringify(parentO.value, null, 2)}`);

  parentO.subscribe(function (value) {
    console.log(
      `console.log of current value subscription on parentO updates: ${JSON.stringify(
        value,
        null,
        2
      )}`
    );
  });

  childO.value = 2;
}
main();
