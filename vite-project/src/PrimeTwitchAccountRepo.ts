class PrimeTwitchAccountRepo {
  constructor() {
    this.Observable = {
      state: { online: false }, // Initially offline
      subscribers: [], // Initially empty
    };
  }
  goLive() {
    this.Observable.state.online = true; // Update state to online
    this.notifySubscribers({ online: true }); // Notify all subscribers
  }
  subscribe(callback) {
    this.Observable.subscribers.push(callback); // Add new subscriber
  }
  notifySubscribers(newState) {
    for (const callback of this.Observable.subscribers) {
      callback(newState); // Notify each subscriber with the new state
    }
  }
}
const primeRepo = new PrimeTwitchAccountRepo();
primeRepo.subscribe((newState) =>
  console.log(`You: Prime is online: ${newState.online}`)
);
primeRepo.subscribe((newState) =>
  console.log(`AnotherOne: Prime is online: ${newState.online}`)
);
primeRepo.goLive();
