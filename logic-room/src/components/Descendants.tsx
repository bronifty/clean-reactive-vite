import React from "react";
// import { child, parent, grandparent } from "../store";
function Descendants({ data, title }) {
  const [value, setValue] = React.useState(data.value);
  // const [parentValue, setParentValue] = React.useState(parent.value);
  // const [grandparentValue, setGrandparentValue] = React.useState(
  //   grandparent.value
  // );
  React.useEffect(() => {
    const childSubscription = data.subscribe((value) => {
      setValue(value);
    });
    // const parentSubscription = parent.subscribe((value) => {
    //   setParentValue(value);
    // });
    // const grandParentSubscription = grandparent.subscribe((value) => {
    //   setGrandparentValue(value);
    // });
    return () => {
      childSubscription();
      // parentSubscription();
      // grandParentSubscription();
    };
  }, []);
  const handleButtonClick = () => {
    data.value += 1;
  };
  return (
    <div>
      <div>
        {title}: {value}
      </div>
      {/* <div>Parent Value: {parentValue}</div>
      <div>Grandparent Value: {grandparentValue}</div> */}
      <button onClick={handleButtonClick}>Update Child Value</button>
    </div>
  );
}
export default Descendants;
