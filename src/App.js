import "./App.css";
import Charts from "./components/Charts";
import ConvertFiles from "./components/ConvertFiles";

function App() {
  return (
    <>
      <div className="nav">
        <h1 className="d-flex justify-content-center">
          Parkinson's Annotation Tool
        </h1>
      </div>
      {<ConvertFiles />}
      {<Charts />}
    </>
  );
}

export default App;
