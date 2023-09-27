import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [data, setData] = useState();
  const [url, setUrl] = useState();

  const getData = async () => {
    const { data } = await axios.get(`http://localhost:4000/info`);
    setData(data);
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <h1>{JSON.stringify(data?.name?.name)}</h1>
      <h1>{JSON.stringify(data?.originalPrice?.originalPrice)}</h1>
      <h1>{JSON.stringify(data?.finalPrice?.finalPrice)}</h1>
      <input></input>
    </>
  );
}

export default App;
