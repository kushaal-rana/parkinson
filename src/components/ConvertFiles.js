import React from "react";
import { useState } from "react";
import "./ConvertFiles.css";

export default function ConvertFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const [csvContent, setCSVContent] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const convertToCSV = () => {
    if (selectedFile) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      // const requestData = {
      //   fileName: "test.h5", // Replace with the actual file name
      // };
      // fetch("https://fhr-backend-3e6843936b75.herokuapp.com/execute-script", {
      fetch("https://fhr-backend-3e6843936b75.herokuapp.com/execute-script", {
        method: "POST",
        body: formData,
      })
        .then((resp) => resp.json())
        .then((resp) => {
          setIsLoading(false);
          debugger;
          setDownloadLink(resp.csv_data); // Set the download link
          console.log(resp);
        })
        .catch((error) => console.log(error));
    }
  };

  const displayCSVContent = async (filename) => {
    debugger;
    try {
      const resp = await fetch(
        `https://fhr-backend-3e6843936b75.herokuapp.com/get-csv/${filename}`
      );
      const data = await resp.json();
      setCSVContent(data.content);
      const blob = new Blob([data.content], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadJSON = (filename) => {
    filename.forEach((file) => {
      debugger;
      displayCSVContent(file);
    });
  };

  return (
    <>
      {isLoading ? (
        <div className="spinner">
          <div className="loader"></div>
          <h2>Loading...</h2>
        </div>
      ) : (
        <div className="container2">
          <h5>Upload a H5 file to convert to CSV</h5>

          <input
            type="file"
            accept=".h5"
            onChange={handleFileChange}
            className="file-input"
          />
          <button onClick={convertToCSV} className="upload-button">
            Convert to CSV
          </button>
          {downloadLink && (
            <div>
              <button
                className="upload-button"
                onClick={() => downloadJSON(downloadLink)}
              >
                Download JSON
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
