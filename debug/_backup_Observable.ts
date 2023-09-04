export interface IObservable {
  value: any;
  subscribe(handler: Function): Function;
  push(item: any): void;
  publish(): void;
  compute(): void;
}
export class Observable implements IObservable {
  private _value: any;
  private _previousValue: any;
  private _subscribers: Function[] = [];
  private static _computeActive: Observable | null = null;
  private _computeFunction: Function | null = null;
  private _computeArgs: any[] = [];
  private static _computeChildren: Observable[] = [];
  private _childSubscriptions: Function[] = [];
  private _dependencies: IObservable[] = [];

  constructor(initialValue: any, ...args: any[]) {
    this._previousValue = undefined; // Initialize _previousValue
    if (typeof initialValue === "function") {
      this._computeFunction = initialValue;
      this._computeArgs = args;
      this.compute();
    } else {
      this._value = initialValue;
    }
  }

  addDependency(dependency: IObservable) {
    this._dependencies.push(dependency);
    dependency.subscribe(() => this.compute());
  }

  get value() {
    if (
      Observable._computeActive &&
      !Observable._computeChildren.includes(this)
    ) {
      Observable._computeChildren.push(this);
    }
    return this._value;
  }

  set value(newValue: any) {
    console.log(`Observable set value ${JSON.stringify(newValue, null, 2)}`);

    this._previousValue = this._value; // Store the current value as the previous value
    this._value = newValue;
    this.publish();
  }

  push(item: any) {
    if (Array.isArray(this._value)) {
      this._value.push(item);
    } else {
      throw new Error("Push can only be called on an observable array.");
    }
  }

  subscribe(handler: Function) {
    this._subscribers.push(handler);
    return () => {
      const index = this._subscribers.indexOf(handler);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  publish() {
    console.log(`Observable publish`);
    this._subscribers.forEach((handler) => {
      console.log(
        `Observable publish this._subscribers.forEach(handler) ${JSON.stringify(
          handler,
          null,
          2
        )}`
      );
      handler(this._value, this._previousValue);
    }); // Pass both current and previous values
  }

  static delay(ms: number) {
    let timeoutId: number;
    const promise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return { promise, clear };
  }
  bindComputedObservable(sourceObservable: IObservable) {
    sourceObservable.subscribe(() => {
      this.compute();
    });
  }
  compute() {
    if (this._computeFunction) {
      const computedValue = this._computeFunction(...this._computeArgs);

      if (computedValue instanceof Promise) {
        computedValue.then((resolvedValue) => {
          this._value = resolvedValue;
          this.publish();
        });
      } else {
        this._value = computedValue;
        this.publish();
      }
    }
  }
}

export class ObservableFactory {
  static create(initialValue: any, ...args: any[]): IObservable {
    return new Observable(initialValue, ...args);
  }
}

async function main() {
  // // Function that logs changes to the console
  const logChanges = (current: any, previous: any) => {
    console.log(`Changed to ${current} from ${previous} `);
  };
  // // Creating observable values
  // console.log("Creating observable values");
  // const obsValue = ObservableFactory.create("initial");
  // obsValue.subscribe(logChanges);
  // console.log(obsValue.value); // 'initial'
  // obsValue.value = "second"; // logChanges('second', 'initial');

  // // Working with arrays
  // console.log("Working with arrays");
  // const obsArray = ObservableFactory.create([1, 2, 3]);
  // obsArray.subscribe(logChanges);
  // console.log(obsArray.value); // [1, 2, 3]
  // obsArray.push(4); // silent update
  // obsArray.publish(); // logChanges([1, 2, 3, 4]);
  // obsArray.push(5); // silent update
  // obsArray.publish(); // logChanges([1, 2, 3, 4, 5]);
  // obsArray.value = [4, 5]; // logChanges([4, 5], [1, 2, 3, 4]);

  // // Working with computed observables
  // console.log("Working with computed observables");
  // const a = ObservableFactory.create(1);
  // const b = ObservableFactory.create(1);
  // const c = ObservableFactory.create(1);
  // const computeSumWithArg = (arg: number) => a.value + b.value + c.value + arg;
  // const computed = ObservableFactory.create(computeSumWithArg, 3);
  // computed.subscribe(logChanges);
  // console.log(`computed.value: ${computed.value}`); // computed.value: 6
  // a.value = 2; // Changed to 7 from 6
  // b.value = 2; // Changed to 8 from 7
  // c.value = 2; // Changed to 9 from 8

  // // Working with computed observables that return Promises
  // console.log("Working with async computed observables");
  // const msTimeout = 100;
  // const x = ObservableFactory.create(1);
  // const y = ObservableFactory.create(1);
  // const z = ObservableFactory.create(1);
  // const asyncComputeSumWithArg = async (arg: number) => {
  //   // Simulating an asynchronous operation
  //   await Observable.delay(msTimeout).promise; // Wait for 100 ms
  //   return x.value + y.value + z.value + arg;
  // };
  // console.log("Creating asyncComputed");
  // const asyncComputed = ObservableFactory.create(asyncComputeSumWithArg, 3);
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("subscribing to asyncComputed with logChanges effect");
  // asyncComputed.subscribe(logChanges);
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("publishing asyncComputed");
  // asyncComputed.publish(); // changed to 6 from undefined
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("Setting x.value to 2 after 100ms");
  // x.value = 2; // Changed to 7 from 6
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("Setting y.value to 2 after 100ms");
  // y.value = 2; // Changed to 8 from 7
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("Setting z.value to 2 after 100ms");
  // z.value = 2; // Changed to 9 from 8
  // await Observable.delay(msTimeout).promise; // Wait for 100 ms
  // console.log("accessing asyncComputed.value after 100ms");
  // console.log(`asyncComputed.value: ${asyncComputed.value}`); // 9

  // // test overwrite a computed's value without changing its own internal computedFunction
  // console.log(
  //   "testing setting a new observable dependency calculation on an existing observable"
  // );
  // const i = ObservableFactory.create(1);
  // const testNewFuncExistingObserver = (arg: IObservable) => {
  //   return arg.value;
  // };

  // console.log(
  //   "setting asyncComputed's internal value to the return value of a computed observable dependency function, which should trigger a console log from asyncComputed without a recalculation of its own internal computedFunction"
  // );
  // asyncComputed.value = testNewFuncExistingObserver(i); // expecting asyncComputed's own log subscription to fire with the new value of i (1)
  // console.log(`asyncComputed.value: ${asyncComputed.value}`); // 1
  // console.log(
  //   "setting i.value to 2 expecting no change (asyncComputed's own log subscription should not fire)"
  // );
  // i.value = 2; // expecting no change
  // console.log(
  //   `setting z.value to 3 which should trigger asyncComputed's child subscription to fire with a call to asyncComputed's compute function, which recalculates its internal computedFunction including the value of child observable values followed by a call to asyncComputed's publish function which loops over its own subscriptions and fires them; the logSubscription should fire giving an updated value of asyncComputed.value`
  // );
  // z.value = 3; // expecting a recalculation of the asyncComputed internal computedFunction

  // Working with nth order computed observables (child computed from parent and grandchild)
  console.log("Working with nth-order computed observables");
  const m1 = ObservableFactory.create(1);
  m1.subscribe((update: IObservable) =>
    console.log(`m1 ${JSON.stringify(update, null, 2)}`)
  );
  const firstComputedFunction = (arg: number) => m1.value + arg;
  const firstComputed = ObservableFactory.create(firstComputedFunction, 1);
  firstComputed.subscribe((update: IObservable) =>
    console.log(`firstComputed ${JSON.stringify(update, null, 2)}`)
  );
  console.log(`firstComputed.value: ${firstComputed.value}`);
  const secondComputedFunction = (arg: number) => firstComputed.value + arg;
  const secondComputed = ObservableFactory.create(secondComputedFunction, 1);
  secondComputed.subscribe((update: IObservable) =>
    console.log(`secondComputed ${JSON.stringify(update, null, 2)}`)
  );
  console.log(`secondComputed.value: ${secondComputed.value}`);

  m1.value = 2; // Changed to 5 from 4
  // n1.value = 2; // Changed to 8 from 7
  // o1.value = 2; // Changed to 9 from 8
}

main();
