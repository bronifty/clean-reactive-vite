// class Cup {
//   contents = "water";
//   consume() {
//     console.log("You drink the ", this.contents, ". Hydrating!");
//   }
// }
// class Bowl {
//   contents = "chili";
//   consume() {
//     console.log("You eat the ", this.contents, ". Spicy!");
//   }
// }
// const cup = new Cup();
// const bowl = new Bowl();
// // cup.consume();
// // bowl.consume();
// cup.consume = bowl.consume;
// cup.consume(); // you eat the water spicy
// cup.consume = bowl.consume.bind(bowl); // binds the bowl's consume method to the bowl's this context
// cup.consume(); // You eat the  chili . Spicy!

class Cup {
  contents = "water";
  // arrow function lexically scoped (Cup's consume method will always refer to Cup's this.contents of 'water')
  consume = () => {
    console.log("You drink the ", this.contents, ". Hydrating!");
  };
}
class Bowl {
  contents = "chili";
  // change from arrow to regular function to unbind the method from lexical scope (Bowl's consume method will refer to the caller's this.contents)
  consume() {
    console.log("You eat the ", this.contents, ". Spicy!");
  }
}
const cup = new Cup();
const bowl = new Bowl();
cup.consume = bowl.consume;
cup.consume(); // You eat the water. Spicy!
// reset with new object
const cup2 = new Cup();
const bowl2 = new Bowl();
bowl2.consume = cup2.consume;
bowl2.consume(); // You drink the water . Hydrating!
