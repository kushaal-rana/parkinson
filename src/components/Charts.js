import React, { useState, useRef } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";
import "./Charts.css";

export default function Charts() {
  const [timestamps, setTimeStamp] = useState([]);
  const [xValues, setxValues] = useState([]);
  const [yValues, setyValues] = useState([]);
  const [zValues, setzValues] = useState([]);
  const [xGyroValues, setxGyroValues] = useState([]);
  const [yGyroValues, setyGyroValues] = useState([]);
  const [zGyroValues, setzGyroValues] = useState([]);
  const [xRange, setXRange] = useState([]);
  const [xAnnotation, setXAnnotation] = useState();
  const [yAnnotation, setYAnnotation] = useState();
  const [axis, setAxis] = useState();
  const [serial, setSerial] = useState(1);
  const [videoSource, setVideoSource] = useState(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);
  const chart4Ref = useRef(null);
  const chart5Ref = useRef(null);
  const chart6Ref = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [calTimeDiff, setTimeDiff] = useState(true);
  const [disableClick, setDisableClick] = useState(false);

  const updateChart = (results) => {
    const chartData = results.data;
    debugger
    setxValues(chartData.map((d) => d.x_accel));
    setyValues(chartData.map((d) => d.y_accel));
    setzValues(chartData.map((d) => d.z_accel));
    setxGyroValues(chartData.map((d) => d.x_gyro));
    setyGyroValues(chartData.map((d) => d.y_gyro));
    setzGyroValues(chartData.map((d) => d.z_gyro));
    setTimeStamp(
      unixEpochToDateTime(
        chartData.map((data) => new Date(data.time).getTime())
      )
    );
  };

  function unixEpochToDateTime(timestamp) {
    let timeString = timestamp.map((time) => {
      let unixTime = time;
      return new Date(unixTime);
    });
    return timeString;
  }

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
    setButtonDisabled(true);
  };
  // var xVal = null;
  // var yVal = null;
  // var axisVal = null;

  // Show the annotation popup
  function showPopup(axis, x, y) {
    setDisableClick(true);
    let popup = document.getElementById("popup");
    popup.style.display = "block";
    document.getElementById("xValue").innerHTML = "Timestamp: " + x;
    document.getElementById("yValue").innerHTML = "Value :" + y.toFixed(3);
    setAxis(axis);
  }

  function showTimeStartPopup() {
    let popup = document.getElementById("timepopup");
    popup.style.display = "block";
  }

  function addAnnotation() {
    var annotationInput = document.getElementById("annotation-input");
    var annotation = annotationInput.value;
    if (annotation !== "") {
      var row = document.createElement("tr");
      var serialCell = document.createElement("td");
      setSerial(serial + 1);
      serialCell.textContent = serial;
      row.appendChild(serialCell);

      var axisCell = document.createElement("td");
      axisCell.textContent = axis;
      row.appendChild(axisCell);

      var xCell = document.createElement("td");
      const [datePart, timePart] = xAnnotation.split(" ");

      const [hours, minutes, seconds] = timePart.split(":");

      xCell.textContent = hours + ":" + minutes + ":" + seconds;

      row.appendChild(xCell);

      var yCell = document.createElement("td");
      yCell.textContent = yAnnotation.toFixed(3);
      row.appendChild(yCell);

      var aCell = document.createElement("td");
      aCell.textContent = annotation;
      row.appendChild(aCell);

      // Append the new row to the table
      document.getElementById("myTable").appendChild(row);
    }
    // xVal = null;
    // yVal = null;

    annotationInput.value = "";
    hidePopup(false);
  }

  function changeStartTime() {
    var annotationInput = document.getElementById("startTime-input");
    var startTime = annotationInput.value;
    debugger
    let origin = 0;
    if (startTime !== "") {
      for (const dateTime of timestamps) {
        if (typeof dateTime === "string") {
          alert("You have already set the starting time");
          setTimeDiff(false);
          break;
        } else {
          let currTime = dateTime;
          var hours = currTime.getHours();
          var minutes = "0" + currTime.getMinutes();
          var seconds = "0" + currTime.getSeconds();
          var millisecond = "0" + currTime.getMilliseconds();
          let finalTime =
            hours +
            ":" +
            minutes.substr(-2) +
            ":" +
            seconds.substr(-2) +
            ":" +
            millisecond.substr(-3);

          if (finalTime === startTime) {
            origin = currTime;
            break;
          }
        }
      }
        debugger
      if (calTimeDiff) {
        const timeDiffArray = timestamps.map((date) => {
          const timeDiff = date - origin;
          const timeDiffFormatted = new Date(timeDiff).toISOString();
          return timeDiffFormatted;
        });
        setXRange([timeDiffArray[0], timeDiffArray[timeDiffArray.length - 1]]);
        setTimeStamp(timeDiffArray);
        setTimeDiff(false);
      }
    }
    hidePopup();
    setDisableClick(false);
  }

  const handleClickX = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Acc-X", event.points[0].x, event.points[0].y);

      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickY = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Acc-Y", event.points[0].x, event.points[0].y);
      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickZ = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Acc-Z", event.points[0].x, event.points[0].y);
      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickGyroZ = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Gyro-Z", event.points[0].x, event.points[0].y);
      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };
  const handleClickGyroY = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Gyro-Y", event.points[0].x, event.points[0].y);
      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };
  const handleClickGyroX = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYAnnotation(y);
      showPopup("Gyro-X", event.points[0].x, event.points[0].y);
      const newAnnotation = {
        x,
        y,
        text: "Annotation" + serial,
        showarrow: true,
        arrowhead: 3,
        ax: -30,
        ay: -40,
        font: { color: "white" },
        arrowcolor: "blue",
        bgcolor: "black",
      };
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };
  function hidePopup(removeAnnotation = true) {
    setDisableClick(false);
    var popup = document.getElementById("popup");
    var timepopup = document.getElementById("timepopup");
    if (popup.style.display !== "none" && removeAnnotation) {
      setAnnotations((prevAnnotations) => {
        const updatedAnnotations = [...prevAnnotations];
        updatedAnnotations.pop(); // Remove the last element
        return updatedAnnotations;
      });
    }
    if (popup.style.display !== "none") {
      popup.style.display = "none";
    }
    if (timepopup.style.display !== "none") {
      timepopup.style.display = "none";
    }
  }

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

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    const videoURL = URL.createObjectURL(file);
    setVideoSource(videoURL);
  };

  const handleRelayout = (event) => {
    if (event["xaxis.range[0]"]) {
      let start = event["xaxis.range[0]"];
      let end = event["xaxis.range[1]"];
      setXRange([new Date(start), new Date(end)]);
    }
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-center">
          <br />
          <div className="my-5  mx-4 ">
            <button
              className="btn btn-primary "
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
          <hr />
          <div className=" d-flex justify-content-center my-5">
            <button
              className="btn btn-primary"
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
        </div>

        <div className="container ">
          <div className="main-charts">
            <div className="video-player-container">
              {videoSource && (
                <div>
                  <video
                    controls
                    style={{
                      width: "85%",
                    }}
                  >
                    <source src={videoSource} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
            <div className="chart-container" id="chart3">
              <Plot
                ref={chart3Ref}
                id="chart3"
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
                  dragmode: "pan",
                  annotations: annotations,

                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S:%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    fixedrange: true,
                    title: "Accelerometer Z",
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickZ}
              />
            </div>
            <div style={{ marginLeft: "420px" }}>
              {buttonDisabled && (
                <button
                  className="btn btn-primary "
                  style={{ display: "block" }}
                  onClick={showTimeStartPopup}
                >
                  Select the Start Time
                </button>
              )}
            </div>
            <hr />
            <div className="chart-container" id="chart2">
              <Plot
                ref={chart2Ref}
                id="chart2"
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
                  dragmode: "pan",
                  annotations: annotations,

                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S:%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    title: "Accelerometer Y",
                    fixedrange: true,
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickY}
              />
            </div>
            <hr />
            <div className="chart-container" id="chart1">
              <Plot
                ref={chart1Ref}
                id="chart1"
                data={[
                  {
                    x: timestamps,
                    y: xValues,
                    mode: "lines",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Accelerometer X",
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  dragmode: "pan",
                  gridwidth: 0.5,
                  annotations: annotations,
                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray",
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S.%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    title: "Accelerometer X",
                    fixedrange: true,
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickX}
              />

              <div className="popup" id="timepopup" style={{ display: "none" }}>
                <h3>Enter the Start Time</h3>
                <input type="text" id="startTime-input" />
                <button onClick={changeStartTime} className="buttonP">
                  Submit
                </button>
                <button onClick={() => hidePopup(true)} className="buttonP">
                  Close
                </button>
              </div>
            </div>
            <hr />
            <div className="chart-container" id="chart4">
              <Plot
                ref={chart4Ref}
                id="chart4"
                data={[
                  {
                    x: timestamps,
                    y: zGyroValues,
                    mode: "lines  ",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Gyroscope Z", // Set the fixed y-axis range
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  dragmode: "pan",
                  annotations: annotations,

                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray", // Set the color of the grid lines
                    gridwidth: 0.5,
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S:%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    fixedrange: true,
                    title: "Gyroscope Z",
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickGyroZ}
              />
            </div>
            <hr />
            <div className="chart-container" id="chart5">
              <Plot
                ref={chart5Ref}
                id="chart5"
                data={[
                  {
                    x: timestamps,
                    y: yGyroValues,
                    mode: "lines",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Gyroscope Y",
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  dragmode: "pan",
                  gridwidth: 0.5,
                  annotations: annotations,
                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray",
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S.%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    title: "Gyroscope Y",
                    fixedrange: true,
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickGyroY}
              />

              <div className="popup" id="timepopup" style={{ display: "none" }}>
                <h3>Enter the Start Time</h3>
                <input type="text" id="startTime-input" />
                <button onClick={changeStartTime} className="buttonP">
                  Submit
                </button>
                <button onClick={() => hidePopup(true)} className="buttonP">
                  Close
                </button>
              </div>
            </div>
            <hr />
            <div className="chart-container" id="chart6">
              <Plot
                ref={chart6Ref}
                id="chart6"
                data={[
                  {
                    x: timestamps,
                    y: zGyroValues,
                    mode: "lines",
                    marker: { color: "green" },
                  },
                ]}
                layout={{
                  title: "Gyroscope X",
                  width: 1000,
                  height: 500,
                  hovermode: "closest",
                  dragmode: "pan",
                  gridwidth: 0.5,
                  annotations: annotations,
                  xaxis: {
                    title: "Timestamp",
                    type: "date",
                    gridcolor: "lightgray",
                    range: xRange,
                    rangeslider: {
                      visible: true,
                      range: xRange,
                    },
                    tickformat: "%H:%M:%S.%L",
                    rangeselector: {
                      buttons: [
                        {
                          count: 5,
                          label: "5 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 10,
                          label: "10 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 15,
                          label: "15 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 30,
                          label: "30 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          count: 45,
                          label: "45 sec",
                          step: "second",
                          stepmode: "backward",
                        },
                        {
                          label: "All",
                          step: "all",
                        },
                      ],
                    },
                  },
                  yaxis: {
                    title: "Gyroscope X",
                    fixedrange: true,
                  },
                }}
                onRelayout={handleRelayout}
                onClick={handleClickGyroX}
              />

              <div className="popup" id="timepopup" style={{ display: "none" }}>
                <h3>Enter the Start Time</h3>
                <input type="text" id="startTime-input" />
                <button onClick={changeStartTime} className="buttonP">
                  Submit
                </button>
                <button onClick={() => hidePopup(true)} className="buttonP">
                  Close
                </button>
              </div>
            </div>
            <hr />


          </div>

          <div className="annotation-container">
            <h2 className="text-center my-3">Output</h2>
            <div id="tableContainer">
              <table id="myTable">
                <tbody>
                  <tr>
                    <th> S.No </th>
                    <th>Axis</th>
                    <th>Timestamp</th>
                    <th>Value</th>
                    <th>Annotation</th>
                  </tr>
                </tbody>
              </table>
              <div className="text-center my-5">
                <button
                  id="downloadBtn"
                  onClick={downloadJson}
                  className="buttonD "
                >
                  Download as JSON File
                </button>
              </div>
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
          <button onClick={() => hidePopup(true)} className="buttonP">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
