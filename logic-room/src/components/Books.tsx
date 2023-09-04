import React from "react";
import Form from "./Form";

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

  return (
    <div>
      <h1>{title}</h1>
      <div>{JSON.stringify(dataValue, null, 2)}</div>
      <Form data={data} />
    </div>
  );
}
export default Descendants;
