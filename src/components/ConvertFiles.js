import React, {useState} from 'react';
import "./ConvertFiles.css";


export default function ConvertFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      console.log("file",selectedFile);
      // Use "http://127.0.0.1:5000/execute-script to run locally
      fetch("https://parkinsons.compas.cs.stonybrook.edu/api/execute-script", {
        method: "POST",
        body: formData,
      })
      .then((resp) => resp.json())
      .then((resp) => {
          setIsLoading(false);
        // Create a URL for the blob and generate a download link
          downloadJSON(resp.csv_data)
        })
        .catch((error) => {
          setIsLoading(false);
          console.error("Error:", error);
        });
    }
  };

  const displayCSVContent = async (filename) => {
    try {
      const resp = await fetch(
        // Use http://127.0.0.1:5000/get-csv/${filename} to run locally
        `https://parkinsons.compas.cs.stonybrook.edu/api/get-csv/${filename}`
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
            Download File
          </button>
         
        </div>
      )}
    </>
  );
}

// working now just see from backend how are we getting the file pass it to download and then do it

// export default function ConvertFiles() {

//   const handleDownload = () => {
//     fetch('http://localhost:8000/response.gz')
//       .then(response => response.blob())
//       .then(blob => {
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'downloaded_file.gz';
//         a.click();
//         URL.revokeObjectURL(url);
//       })
//       .catch(error => {
//         console.error('Error downloading file:', error);
//       });
//   };
  

//   return (
//     <div>
//       <button onClick={handleDownload}>Download .gz File</button>

//     </div>
//   );
// }











