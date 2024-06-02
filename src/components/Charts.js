import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
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
  const [yXAnnotation, setYXAnnotation] = useState();
  const [yYAnnotation, setYYAnnotation] = useState();
  const [yZAnnotation, setYZAnnotation] = useState();
  const [axis, setAxis] = useState();
  const [serial, setSerial] = useState(1);
  const [videoSource, setVideoSource] = useState(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);
  const chart4Ref = useRef(null);
  const chart5Ref = useRef(null);
  const chart6Ref = useRef(null);
  const videoRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [disableClick, setDisableClick] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentFormatTime, setCurrentFormatTime] = useState('00:00:000');
  const [xValue, setXValue] = useState(new Date('00:00:000'));


  function normalizeTimestamps(timestamps) {
    var selectedStartTime = timestamps[0];
    let startOfDay = new Date(selectedStartTime);
    startOfDay.setHours(0, 0, 0, 0);
    let timeDifference = selectedStartTime - startOfDay;
    let adjustedTimestamps = timestamps.map(timestamp => {
      let adjustedDate = new Date(timestamp);
      adjustedDate.setTime(adjustedDate.getTime() - timeDifference);
      return adjustedDate;
    });
    return adjustedTimestamps;
  }


  const updateChart = (results) => {
    const chartData = results.data;
    setxValues(chartData.map((d) => d.x_accel));
    setyValues(chartData.map((d) => d.y_accel));
    setzValues(chartData.map((d) => d.z_accel));
    setxGyroValues(chartData.map((d) => d.x_gyro));
    setyGyroValues(chartData.map((d) => d.y_gyro));
    setzGyroValues(chartData.map((d) => d.z_gyro));
    let times = unixEpochToDateTime(
      chartData.map((data) => new Date(data.time).getTime())
    );
    let normalizedTimestamps = normalizeTimestamps(times);

    setTimeStamp(
      normalizedTimestamps
    );
    const initialXRange = normalizedTimestamps[0] ? [normalizedTimestamps[0], new Date(normalizedTimestamps[0].getTime() + 60000)] : [];
    setXRange(initialXRange)
  };

  function unixEpochToDateTime(timestamp) {
    let timeString = timestamp.map((time) => {
      let unixTime = time;
      return new Date(unixTime);
    });
    return timeString;
  }

  const changeHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const rowsArray = [];
          const valuesArray = [];

          results.data.map((d) => {
            rowsArray.push(Object.keys(d));
            valuesArray.push(Object.values(d));
          });
          updateChart(results);
        },
      });
      setButtonDisabled(true);
    }
  };

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


      var xCell = document.createElement("td");
      const [datePart, timePart] = xAnnotation.split(" ");

      const [hours, minutes, seconds] = timePart.split(":");

      xCell.textContent = hours + ":" + minutes + ":" + seconds;

      row.appendChild(xCell);

      var yXCell = document.createElement("td");
      yXCell.textContent = yXAnnotation.toFixed(3);
      row.appendChild(yXCell);

      var yYCell = document.createElement("td");
      yYCell.textContent = yYAnnotation.toFixed(3);
      row.appendChild(yYCell);

      var yZCell = document.createElement("td");
      yZCell.textContent = yZAnnotation.toFixed(3);
      row.appendChild(yZCell);

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
    if (validateTimeFormat(startTime)) {
      const recordedDate = timestamps[0];
      const year = recordedDate.getFullYear();
      const month = (recordedDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
      const day = recordedDate.getDate().toString().padStart(2, '0');
      const formattedDateString = `${year}-${month}-${day}`;
      const selectedStartTime = new Date(formattedDateString + " " + startTime);

      let startOfDay = new Date(selectedStartTime);
      startOfDay.setHours(0, 0, 0, 0);
      let timeDifference = selectedStartTime - startOfDay;

      let adjustedTimestamps = timestamps.map(timestamp => {
        let adjustedDate = new Date(timestamp);
        adjustedDate.setTime(adjustedDate.getTime() - timeDifference);
        return adjustedDate;
      });

      setTimeStamp(adjustedTimestamps);
    }
    else {
      alert("Please enter the timestamp in correct format(HH:mm:ss:SSS). Ex: 13:51:00:000");
    }
    hidePopup();
    setDisableClick(false);
  }  

  const handleClickX = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYXAnnotation(y);
      showPopup("Acc-X", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart1Ref.current) {
        const plotDataY = chart2Ref.current.props?.data[0];
        const plotDataZ = chart3Ref.current.props?.data[0];
        const indexY = plotDataY.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexZ = plotDataZ.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexY !== -1) {
          setYYAnnotation(parseFloat(plotDataY.y[indexY]));
        } else {
          setYYAnnotation(0);
        }
        if (indexZ !== -1) {
          setYZAnnotation(parseFloat(plotDataZ.y[indexZ]));
        } else {
          setYZAnnotation(0);
        }
      }
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickY = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYYAnnotation(y);
      showPopup("Acc-Y", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart2Ref.current) {
        const plotDataX = chart1Ref.current.props?.data[0];
        const plotDataZ = chart3Ref.current.props?.data[0];
        const indexX = plotDataX.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexZ = plotDataZ.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexX !== -1) {
          setYXAnnotation(parseFloat(plotDataX.y[indexX]));
        } else {
          setYXAnnotation(0);
        }
        if (indexZ !== -1) {
          setYZAnnotation(parseFloat(plotDataZ.y[indexZ]));
        } else {
          setYZAnnotation(0);
        }
      }
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickZ = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYZAnnotation(y);
      showPopup("Acc-Z", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart3Ref.current) {
        const plotDataX = chart1Ref.current.props?.data[0];
        const plotDataY = chart2Ref.current.props?.data[0];
        const indexX = plotDataX.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexY = plotDataY.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexX !== -1) {
          setYXAnnotation(parseFloat(plotDataX.y[indexX]));
        } else {
          setYXAnnotation(0);
        }
        if (indexY !== -1) {
          setYYAnnotation(parseFloat(plotDataY.y[indexY]));
        } else {
          setYYAnnotation(0);
        }
      }
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };

  const handleClickGyroZ = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYZAnnotation(y);
      showPopup("Gyro-Z", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart4Ref.current) {
        const plotDataX = chart6Ref.current.props?.data[0];
        const plotDataY = chart5Ref.current.props?.data[0];
        const indexX = plotDataX.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexY = plotDataY.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexX !== -1) {
          setYXAnnotation(parseFloat(plotDataX.y[indexX]));
        } else {
          setYXAnnotation(0);
        }
        if (indexY !== -1) {
          setYYAnnotation(parseFloat(plotDataY.y[indexY]));
        } else {
          setYYAnnotation(0);
        }
      }
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };
  const handleClickGyroY = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYYAnnotation(y);
      showPopup("Gyro-Y", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart5Ref.current) {
        const plotDataX = chart6Ref.current.props?.data[0];
        const plotDataZ = chart4Ref.current.props?.data[0];
        const indexX = plotDataX.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexZ = plotDataZ.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexX !== -1) {
          setYXAnnotation(parseFloat(plotDataX.y[indexX]));
        } else {
          setYXAnnotation(0);
        }
        if (indexZ !== -1) {
          setYZAnnotation(parseFloat(plotDataZ.y[indexZ]));
        } else {
          setYZAnnotation(0);
        }
      }
      setAnnotations((prevAnnotation) => [...prevAnnotation, newAnnotation]);
    }
  };
  const handleClickGyroX = (event) => {
    if (!disableClick) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setXAnnotation(x);
      setYXAnnotation(y);
      showPopup("Gyro-X", event.points[0].x, event.points[0].y);
      const targetDate = new Date(x);
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
      if (chart6Ref.current) {
        const plotDataY = chart5Ref.current.props?.data[0];
        const plotDataZ = chart4Ref.current.props?.data[0];
        const indexY = plotDataY.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        const indexZ = plotDataZ.x.findIndex(dateStr => dateStr.getTime() === targetDate.getTime());
        if (indexY !== -1) {
          setYYAnnotation(parseFloat(plotDataY.y[indexY]));
        } else {
          setYYAnnotation(0);
        }
        if (indexZ !== -1) {
          setYZAnnotation(parseFloat(plotDataZ.y[indexZ]));
        } else {
          setYZAnnotation(0);
        }
      }
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

  function validateTimeFormat(input) {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]):([0-9]{3})$/;
    return regex.test(input);
  }

  const handleGoToTimestamp = () => {
    const timestampInput = document.getElementById("timestampInput").value;
    const secondDate = timestamps[timestamps.length - 1];
    var formattedDateString = "1970-01-01 "

    if (validateTimeFormat(timestampInput)) {
      if (typeof secondDate === 'object' && secondDate instanceof Date) {
        const year = secondDate.getFullYear();
        const month = (secondDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
        const day = secondDate.getDate().toString().padStart(2, '0');
        formattedDateString = `${year}-${month}-${day}`;
      }

      const inputDate = new Date(formattedDateString + " " + timestampInput);
      const before = new Date(inputDate.getTime() - 15000);
      const after = new Date(inputDate.getTime() + 15000);
      setXRange([before, after]);
    }
    else {
      alert("Please enter the timestamp in correct format(HH:mm:ss:SSS). Ex: 13:51:00:000");
    }
  };

  function downloadCSV() {
    var rows = Array.from(
      document.querySelectorAll("#myTable tr:not(:first-child)")
    );

    var csvData = "Timestamp,X Value,Y Value,Z Value,Annotation\n";

    // Iterate over the rows and extract the cell values
    rows?.forEach(function (row) {
      var rowData = [
        row.cells[1].textContent,
        row.cells[2].textContent,
        row.cells[3].textContent,
        row.cells[4].textContent,
        row.cells[5].textContent,
      ];
      csvData += rowData.join(",") + "\n";
    });

    var blob = new Blob([csvData], { type: "text/csv" });

    // Create a link element for downloading the CSV file
    var downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "table_data.csv";

    // Simulate a click on the download link to initiate the download
    downloadLink.click();
  }

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    // Check if a file is selected
    if (file) {
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      setVideoSource(videoURL);
    }
  };

  const handleRelayout = (event) => {
    if (event["xaxis.range[0]"]) {
      let start = event["xaxis.range[0]"];
      let end = event["xaxis.range[1]"];
      setXRange([new Date(start), new Date(end)]);
    }
  };

  const videoTimeChange = (event) => {
    const video = event.target;
    const currentTime = video.currentTime;
    const currentFormattedTime = formatTime(currentTime);
    setCurrentFormatTime(currentFormattedTime);
    setVideoTime(event.target.currentTime);
    const secondDate = timestamps[timestamps.length - 1];
    var formattedDateString = "1970-01-01 "

    if (typeof secondDate === 'object' && secondDate instanceof Date) {
      const year = secondDate.getFullYear();
      const month = (secondDate.getMonth() + 1).toString().padStart(2, '0');
      const day = secondDate.getDate().toString().padStart(2, '0');
      formattedDateString = `${year}-${month}-${day}`;
    }

    const combinedDateString = new Date(formattedDateString + "T00:00:00");
    const combinedDate = new Date(combinedDateString);
    const exactDate = new Date(combinedDate.getTime() + (event.target.currentTime) * 1000);
    setXValue(exactDate)
    const before = new Date(combinedDate.getTime() + (event.target.currentTime - 2.5) * 1000);
    const after = new Date(combinedDate.getTime() + (event.target.currentTime + 2.5) * 1000);
    setXRange([before, after]);
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time - Math.floor(time)) * 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
  }

  const setPlayBack = () => {
    videoRef.current.playbackRate = playbackRate;
  }

  const setPlaybackSpeed = (e) => {
    videoRef.current.playbackRate = parseFloat(e.target.value);
    setPlaybackRate(parseFloat(e.target.value));
  }

  const skip = (time) => {
    const video = document.getElementById("myVideo");
    video.currentTime = video.currentTime + time;
  }



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
              disabled={!videoFile}
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
          <div className="d-flex justify-content-center my-5" style={{ marginLeft: "1%" }}>
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
        </div>
        {buttonDisabled && (
          <div style={{ marginLeft: "38%", marginTop: "-1%" }}>
            <label>Enter Timestamp  </label>
            <input style={{ margin: "6px 1px 7px 12px" }} type="text" id="timestampInput" />
            <button style={{ margin: "6px 1px 7px 15px" }} className="btn btn-primary" onClick={handleGoToTimestamp}>Go</button>
          </div>)}

        <div className="container " style={{ display: "block" }} >
          <div style={{ width: "100%" }} className="main-charts">
            <div style={{ width: "50%", float: "left" }}>
              <div className="video-player-container">
                {videoSource && (
                  <div style={{ marginTop: "7%" }}>
                    <video
                      id="myVideo"
                      ref={videoRef}
                      onCanPlay={() => setPlayBack()}
                      controls
                      onTimeUpdate={(e) => videoTimeChange(e)}
                      style={{
                        width: "93%",
                      }}
                      playbackRate={playbackRate}
                    >
                      <source src={videoSource} type="video/mp4" />
                    </video>
                    <div style={{ position: 'relative', top: -60, left: 130, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faBackward} onClick={() => skip(-2)} style={{ cursor: 'pointer', marginRight: '10px', color: 'white' }} />
                      <FontAwesomeIcon icon={faForward} onClick={() => skip(2)} style={{ cursor: 'pointer', color: 'white' }} />
                    </div>
                    <div class="center-container">
                      <div >
                        <span>Current Time in Video is   </span>{currentFormatTime}
                      </div>
                      <div >
                        <div className="dropdown"><span>Set Playback Speed of Video:   </span>
                          <select value={playbackRate} onChange={setPlaybackSpeed}>
                            <option value="0.10">0.1x</option>
                            <option value="0.2">0.2x</option>
                            <option value="0.25">0.25x</option>
                            <option value="0.5">0.5x</option>
                            <option value="1" selected>1x</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <br /><br />


              <div className="annotation-container">
                <h2 className="text-center my-3">Output</h2>
                <div id="tableContainer">
                  <table id="myTable">
                    <tbody>
                      <tr>
                        <th> S.No </th>
                        <th>Timestamp</th>
                        <th>X Value</th>
                        <th>Y Value</th>
                        <th>Z Value</th>
                        <th>Annotation</th>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-center my-5">
                    <button
                      id="downloadBtn"
                      onClick={downloadCSV}
                      className="buttonD "
                    >
                      Download as CSV File
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: "50%", display: "flex", flexWrap: "wrap", justifyContent: "space-evenly" }}>
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
                    width: 700,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    }],
                  }}
                  onRelayout={handleRelayout}
                  onClick={handleClickZ}
                />
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
                    width: 700,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    },]
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
                    width: 700,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    }]
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
                    width: 700
                    ,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    }]
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
                    width: 700,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    }]
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
                      y: xGyroValues,
                      mode: "lines",
                      marker: { color: "green" },
                    },
                  ]}
                  layout={{
                    title: "Gyroscope X",
                    width: 700,
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
                    shapes: [{
                      type: 'line',
                      x0: xValue,
                      y0: 0,
                      x1: xValue,
                      yref: 'paper',
                      y1: 1,
                      line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                      }
                    }]
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