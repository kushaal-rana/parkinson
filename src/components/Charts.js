import React, { useState } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";

export default function Charts() {
  const [timestamps, setTimeStamp] = useState([]);
  const [xValues, setxValues] = useState([]);
  const [yValues, setyValues] = useState([]);
  const [zValues, setzValues] = useState([]);
  const [videoSource, setVideoSource] = useState(null);

  var windowSize = 100000;
  const updateChart = (results) => {
    // Extract data from the parsed results
    const chartData = results.data;
    // Extract values for x-axis and y-axis
    // const xValues = chartData.map((d) => d.x_accel);
    setxValues(chartData.map((d) => d.x_accel));
    // yValues = chartData.map((d) => d.y_accel);
    setyValues(chartData.map((d) => d.y_accel));
    setzValues(chartData.map((d) => d.z_accel));
    // timestamps = chartData.map((data) => new Date(data.time).getTime());
    setTimeStamp(
      unixEpochToDateTime(
        chartData.map((data) => new Date(data.time).getTime())
      )
    );
  };

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        // Call the updateChart function to update the chart with the parsed data
        updateChart(results);
      },
    });
  };
  var xVal = null;
  var yVal = null;
  var axisVal = null;
  var serial = 1;

  // Show the annotation popup
  function showPopup(axis, x, y) {
    debugger;
    let popup = document.getElementById("popup");
    popup.style.display = "block";
    document.getElementById("xValue").innerHTML = "Timestamp: " + x;
    document.getElementById("yValue").innerHTML = "Value :" + y.toFixed(3);
    xVal = x;
    yVal = y;
    axisVal = axis;
    // console.log(axisVal);
  }

  function addAnnotation() {
    var annotationInput = document.getElementById("annotation-input");
    var annotation = annotationInput.value;
    if (annotation !== "") {
      // console.log(axisVal,xVal, yVal, annotation);
      // create new row
      var row = document.createElement("tr");

      // Create table data cells and set their values
      var serialCell = document.createElement("td");

      serialCell.textContent = serial;
      serial = serial + 1;
      // console.log(axisVal);
      row.appendChild(serialCell);

      var axisCell = document.createElement("td");
      axisCell.textContent = axisVal;
      // console.log(axisVal);
      row.appendChild(axisCell);

      var xCell = document.createElement("td");
      xCell.textContent = xVal;
      row.appendChild(xCell);

      var yCell = document.createElement("td");
      yCell.textContent = yVal.toFixed(3);
      row.appendChild(yCell);

      var aCell = document.createElement("td");
      aCell.textContent = annotation;
      row.appendChild(aCell);

      // Append the new row to the table
      document.getElementById("myTable").appendChild(row);
    }

    xVal = null;
    yVal = null;

    annotationInput.value = "";
    hidePopup();
  }

  function hidePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
  }

  function unixEpochToDateTime(timestamp) {
    const date = new Date(timestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds

    // Extract the date and time components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Format the components as a human-readable date and time string
    const dateTimeString = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    debugger;
    return dateTimeString;
  }

  const handleClickX = (event) => {
    unixEpochToDateTime(0);
    showPopup("X", event.points[0].x, event.points[0].y);
    console.log(event.points[0].x);
    console.log(event.points[0].y);
    // var myPlot = document.getElementById("charttt");
    // debugger;
    // myPlot.on("plotly_click", function (data) {
    //   console.log(data);
    // });
    // graphAnnotation = {
    //   // text: annotate_text,
    //   x: event.points[0].x,
    //   y: event.points[0].y,
    //   text: "heyy",
    //   showarrow: true,
    //   arrowhead: 7,
    //   ax: 0,
    //   ay: -40,
    // };
  };
  const handleClickY = (event) => {
    showPopup("Y", event.points[0].x, event.points[0].y);
    console.log(event.points[0].x);
    console.log(event.points[0].y);
  };
  const handleClickZ = (event) => {
    showPopup("Z", event.points[0].x, event.points[0].y);
    console.log(event.points[0].x);
    console.log(event.points[0].y);
  };

  function downloadJson() {
    var rows = Array.from(
      document.querySelectorAll("#myTable tr:not(:first-child)")
    );

    // Create an array to hold the table data
    var tableData = [];

    // Iterate over the rows and extract the cell values
    rows?.forEach(function (row) {
      var rowData = {
        timestamp: row.cells[2].textContent,
        value: row.cells[3].textContent,
        annotation: row.cells[4].textContent,
      };

      tableData.push(rowData);
    });

    // Convert the table data to a JSON string
    var jsonData = JSON.stringify(tableData, null, 2);

    // Create a Blob containing the JSON data
    var blob = new Blob([jsonData], { type: "application/json" });

    // Create a link element for downloading the JSON file
    var downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "table_data.json";

    // Simulate a click on the download link to initiate the download
    downloadLink.click();
  }

  function graphclicked(event) {
    console.log(event);
  }

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    const videoURL = URL.createObjectURL(file);
    setVideoSource(videoURL);
  };

  return (
    <>
      <div>
        <div className="my-3  d-flex justify-content-center">
          <button
            class="btn btn-primary "
            style={{ display: "block" }}
            onClick={() => document.getElementById("getCSVFile").click()}
          >
            Click to upload CSV File
          </button>
          <input
            id="getCSVFile"
            type="file"
            name="file"
            onChange={changeHandler}
            accept=".csv"
            style={{ display: "none", margin: "10px auto" }}
          />
        </div>
        <div className=" d-flex justify-content-center">
          <button
            class="btn btn-primary"
            style={{ display: "block" }}
            onClick={() => document.getElementById("getVideoFile").click()}
          >
            Click to upload the Video
          </button>
          <input
            id="getVideoFile"
            type="file"
            accept="video/mp4"
            style={{ display: "none" }}
            onChange={handleVideoChange}
          />
        </div>
        <div className="container ">
          <div className="main-charts">
            <div className="video-player-container">
              {videoSource && (
                <div>
                  <video controls>
                    <source src={videoSource} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
            <div className="chart-container">
              <Plot
                id="chart"
                data={[
                  {
                    x: timestamps,
                    y: xValues,
                    mode: "lines",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Accelerometer X", // Set the fixed y-axis range
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  xaxis: {
                    title: "Timestamp(POSIX)",
                    range: [timestamps[0] - windowSize, timestamps[0]], // Start the chart from the right end
                    // tickmode: 'date',  // Display each value on the x-axis
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                  },
                  yaxis: {
                    title: "Accelerometer X",
                  },
                }}
                onClick={handleClickX}
              />
            </div>
            <hr />
            <div className="chart-container">
              <Plot
                data={[
                  {
                    x: timestamps,
                    y: yValues,
                    mode: "lines  ",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Accelerometer Y", // Set the fixed y-axis range
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  xaxis: {
                    title: "Timestamp(POSIX)",
                    range: [timestamps[0] - windowSize, timestamps[0]], // Start the chart from the right end
                    // tickmode: 'date',  // Display each value on the x-axis
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                  },
                  yaxis: {
                    title: "Accelerometer Y",
                  },
                }}
                onClick={handleClickY}
              />
            </div>
            <hr />
            <div className="chart-container">
              <Plot
                data={[
                  {
                    x: timestamps,
                    y: zValues,
                    mode: "lines  ",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Accelerometer Z", // Set the fixed y-axis range
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  xaxis: {
                    title: "Timestamp(POSIX)",
                    range: [timestamps[0] - windowSize, timestamps[0]], // Start the chart from the right end
                    // tickmode: 'date',  // Display each value on the x-axis
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                  },
                  yaxis: {
                    title: "Accelerometer Z",
                  },
                }}
                onClick={handleClickZ}
              />
            </div>
          </div>
          <div className="annotation-container">
            <h2>Annotations</h2>
            <div id="tableContainer">
              <table id="myTable">
                <tr>
                  <th> S.No </th>
                  <th>Axis</th>
                  <th>Timestamp</th>
                  <th>Value</th>
                  <th>Annotation</th>
                </tr>
              </table>
              <button
                id="downloadBtn"
                onClick={downloadJson}
                className="buttonD"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="popup" id="popup" style={{ display: "none" }}>
          <h3>Enter Annotation</h3>
          <div id="xValue"></div>
          <div id="yValue"></div>
          <input type="text" id="annotation-input" />
          <button onClick={addAnnotation} className="buttonP">
            Submit
          </button>
          <button onClick={hidePopup} className="buttonP">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
