export interface IObservable {
  value: any;
  subscribe(handler: Function): Function;
  push(item: any): void;
  publish(): void;
  compute(): Promise<void>;
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
    this._subscribers.forEach((handler) =>
      handler(this._value, this._previousValue)
    ); // Pass both current and previous values
  }

  static delay(ms: number) {
    let timeoutId: number;
    const promise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return { promise, clear };
  }

  // called by child observable subscriptions and by the constructor
  async compute() {
    if (this._computeFunction) {
      // Unsubscribe old child subscriptions
      this._childSubscriptions.forEach((unsubscribe) => unsubscribe());
      this._childSubscriptions.length = 0;

      Observable._computeActive = this;
      this._previousValue = this._value; // Store the current value as the previous value
      const computedValue = this._computeFunction(...this._computeArgs);
      // Handle the case where the computed value is a Promise
      if (computedValue instanceof Promise) {
        this._value = await computedValue; // Await the promise resolution
      } else {
        this._value = computedValue;
      }
      this.publish();
      Observable._computeActive = null;
      Observable._computeChildren.forEach((child) =>
        this._childSubscriptions.push(child.subscribe(() => this.compute()))
      );
      Observable._computeChildren.length = 0;
    }
  }
}

export class ObservableFactory {
  static create(initialValue: any, ...args: any[]): IObservable {
    return new Observable(initialValue, ...args);
  }
}

async function main() {
  // Function that logs changes to the console
  const logChanges = (current: any, previous: any) => {
    console.log(`Changed to ${current} from ${previous} `);
  };
  // Creating observable values
  console.log("Creating observable values");
  const obsValue = ObservableFactory.create("initial");
  obsValue.subscribe(logChanges);
  console.log(obsValue.value); // 'initial'
  obsValue.value = "second"; // logChanges('second', 'initial');

  // Working with arrays
  console.log("Working with arrays");
  const obsArray = ObservableFactory.create([1, 2, 3]);
  obsArray.subscribe(logChanges);
  console.log(obsArray.value); // [1, 2, 3]
  obsArray.push(4); // silent update
  obsArray.publish(); // logChanges([1, 2, 3, 4]);
  obsArray.push(5); // silent update
  obsArray.publish(); // logChanges([1, 2, 3, 4, 5]);
  obsArray.value = [4, 5]; // logChanges([4, 5], [1, 2, 3, 4]);

  // Working with computed observables
  console.log("Working with computed observables");
  const a = ObservableFactory.create(1);
  const b = ObservableFactory.create(1);
  const c = ObservableFactory.create(1);
  const computeSumWithArg = (arg: number) => a.value + b.value + c.value + arg;
  const computed = ObservableFactory.create(computeSumWithArg, 3);
  computed.subscribe(logChanges);
  console.log(`computed.value: ${computed.value}`); // computed.value: 6
  a.value = 2; // Changed to 7 from 6
  b.value = 2; // Changed to 8 from 7
  c.value = 2; // Changed to 9 from 8

  // Working with computed observables that return Promises
  console.log("Working with async computed observables");
  const msTimeout = 100;
  const x = ObservableFactory.create(1);
  const y = ObservableFactory.create(1);
  const z = ObservableFactory.create(1);
  const asyncComputeSumWithArg = async (arg: number) => {
    // Simulating an asynchronous operation
    await Observable.delay(msTimeout).promise; // Wait for 100 ms
    return x.value + y.value + z.value + arg;
  };
  console.log("Creating asyncComputed");
  const asyncComputed = ObservableFactory.create(asyncComputeSumWithArg, 3);
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("subscribing to asyncComputed with logChanges effect");
  asyncComputed.subscribe(logChanges);
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("publishing asyncComputed");
  asyncComputed.publish(); // changed to 6 from undefined
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("Setting x.value to 2 after 100ms");
  x.value = 2; // Changed to 7 from 6
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("Setting y.value to 2 after 100ms");
  y.value = 2; // Changed to 8 from 7
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("Setting z.value to 2 after 100ms");
  z.value = 2; // Changed to 9 from 8
  await Observable.delay(msTimeout).promise; // Wait for 100 ms
  console.log("accessing asyncComputed.value after 100ms");
  console.log(`asyncComputed.value: ${asyncComputed.value}`); // 9

  // test overwrite a computed's value without changing its own internal computedFunction
  console.log(
    "testing setting a new observable dependency calculation on an existing observable"
  );
  const i = ObservableFactory.create(1);
  const testNewFuncExistingObserver = (arg: IObservable) => {
    return arg.value;
  };

  console.log(
    "setting asyncComputed's internal value to the return value of a computed observable dependency function, which should trigger a console log from asyncComputed without a recalculation of its own internal computedFunction"
  );
  asyncComputed.value = testNewFuncExistingObserver(i); // expecting asyncComputed's own log subscription to fire with the new value of i (1)
  console.log(`asyncComputed.value: ${asyncComputed.value}`); // 1
  console.log(
    "setting i.value to 2 expecting no change (asyncComputed's own log subscription should not fire)"
  );
  i.value = 2; // expecting no change
  console.log(
    `setting z.value to 3 which should trigger asyncComputed's child subscription to fire with a call to asyncComputed's compute function, which recalculates its internal computedFunction including the value of child observable values followed by a call to asyncComputed's publish function which loops over its own subscriptions and fires them; the logSubscription should fire giving an updated value of asyncComputed.value`
  );
  z.value = 3; // expecting a recalculation of the asyncComputed internal computedFunction
}

main();

// ChatGPT Question about Observable subscriptions and webhooks

// would a subscription to an Observable's update with an effect callback be an accurate characterization of what's happening and furthermore, could we characterize the subscription effect as analogous to a webhook firing in response to an event to update subscribers?

// ChatGPT Answer
// Yes, the characterization you've described is quite accurate.

// Subscription to an Observable's Update with an Effect Callback: In the context of Observables, a subscription represents a connection between the Observable (source of values) and an observer (consumer of values). When you subscribe to an Observable, you provide a callback function (often referred to as an "effect" in functional programming) that will be invoked whenever the Observable emits a new value. This effect callback can carry out any side effects, like updating the UI, logging information, etc.

// Analogy to a Webhook Firing in Response to an Event: The analogy to a webhook is also apt. A webhook is a way for one system to notify another system about events in real-time. In the context of Observables, the Observable is like the system generating events, and the subscribers' callbacks are like the webhooks receiving notifications about those events. When the Observable's value changes (an event), it notifies all its subscribers (fires the webhooks), and they can respond to that change (handle the event) as needed.

// So, in essence, subscribing to an Observable with an effect callback is like registering a webhook for a particular event, and the Observable's notification mechanism ensures that the "webhook" gets fired whenever the corresponding event occurs.
