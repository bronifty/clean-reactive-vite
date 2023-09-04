import { ObservableFactory, IObservable } from "./observable/observable";

const child = ObservableFactory.create(() => 1);
const parent = ObservableFactory.create(() => child.value + 1);
const grandparent = ObservableFactory.create(() => parent.value + 1);

export { child, parent, grandparent };
