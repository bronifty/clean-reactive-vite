import React from "react";

function Descendants({ data, title }) {
  const [dataValue, setDataValue] = React.useState(data.value);
  React.useEffect(() => {
    const dataSubscription = data.subscribe((value) => {
      setDataValue(value);
    });
    return () => {
      dataSubscription();
    };
  }, []);
  const handleButtonClick = () => {
    data.value = [...data.value, { name: "another one", author: "iykyk" }];
  };
  return (
    <div>
      <div>
        {title}: {JSON.stringify(dataValue, null, 2)}
      </div>
      <button onClick={handleButtonClick}>Update Child Value</button>
    </div>
  );
}
export default Descendants;
