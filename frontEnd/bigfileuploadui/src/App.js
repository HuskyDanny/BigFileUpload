import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [fileState, setFile] = useState({});
  const [progressBar, setProgressBar] = useState(0);
  function fileOnChange(e) {
    e.preventDefault();
    setFile(e.target.files[0]);
  }

  function xmlHttpRequestPromise(opts) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          console.log(event.loaded, event.total);
          const element = document.getElementById(`chunk${opts.index}`);
          element.style.width = `${(event.loaded / event.total).toFixed(3) *
            100}%`;
        } else {
          alert(`Received ${event.loaded} bytes`); // no Content-Length
        }
      };
      // function handleEvent(e) {
      //   console.log(`${e.type}: ${e.loaded} bytes transferred`);
      // }
      // xhr.addEventListener("progress", handleEvent);
      xhr.send(opts.payload);
    });
  }

  function bigFileUpload() {
    const uploadUrl = "http://localhost:3001/bigFileUpload";

    //const file = e.target.files[0];
    const path = `${fileState.name}-${Date.now()}`;
    const chunks = bigFileProcess(fileState, path);

    setProgressBar(chunks.length);
    const mergeUrl = `http://localhost:3001/merge?filename=${fileState.name}&length=${chunks.length}&filepath=${path}`;

    const postPromise = [];
    chunks.map((chunk, index) => {
      const opts = {
        url: uploadUrl,
        method: "POST",
        payload: chunk,
        index: index
      };
      postPromise.push(
        xmlHttpRequestPromise(opts)
        // fetch(uploadUrl, {
        //   method: "post",

        //   body: chunk
        // })
      );
    });

    Promise.all(postPromise).then(res => {
      console.log(res);
      // const fd = new FormData();

      // fd.append("name", name);
      // fd.append("length", chunks.length);

      fetch(mergeUrl, {
        method: "get"
      }).then(res => {
        console.log(res);
      });
    });
  }

  function bigFileProcess(bigFile, name, piece = 1024 * 1024 * 15) {
    const totalSize = bigFile.size;
    let start = 0;
    let end = 0;
    let index = 0;
    const chunks = [];

    while (start < totalSize) {
      end += piece;

      const formData = new FormData();

      let blob = bigFile.slice(start, end);

      formData.append("chunk", blob);
      formData.append("index", index);
      formData.append("filename", name);

      chunks.push(formData);

      start = end;
      index += 1;
    }

    return chunks;
  }
  return (
    <div className="App">
      <input type="file" onChange={fileOnChange} />
      <input type="submit" onClick={bigFileUpload} />
      {new Array(progressBar).fill(0).map((_, index) => {
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p>{`Subfile${index}`}</p>
            <div class="w3-border">
              <div
                class="w3-blue"
                id={`chunk${index}`}
                style={{ height: "24px", width: "15%" }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;
