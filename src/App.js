import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import * as zip from "@zip.js/zip.js";

function App() {

  const [fileStatus, setFileStatus] = useState(false);
  const [fileInfo, setFileInfo] = useState({});
  const [anonymizedFile, setAnonymizedFile] = useState();

  return (
    <div className="App">

      <div id = "FileSelect">
        <FileSelector fileStatus={fileStatus} updateStatus={setFileStatus} fileInfo={fileInfo} updateFile={setFileInfo}/>
      </div>

      <div id = "Anonymize">
        <Anonymizer fileStatus={fileStatus} fileInfo={fileInfo} setAnonymizedFile={setAnonymizedFile}/>
      </div>

      <div id = "Send">
        <Sender anonymizedFile={anonymizedFile}/>
      </div> 

    </div>



    
  );
}

function FileSelector(props) {


  // const reader = new FileReader();
  // reader.addEventListener("load", (event) => {
  //   const jsonData = JSON.parse(event.target.result);
  //   props.updateFile({fileText: jsonData})
  //   props.updateStatus(true);
  // });
  

  const handleFileSelection = async (event, type) => {
    const f = event.target.files[0];
    if (type === "json") {
        // reader.readAsText(f);
        alert("not supported!");
    } else {
      const reader = new zip.ZipReader(new zip.BlobReader(f))
      const entries = await reader.getEntries({filenameEncoding: "cp437"})
      if (entries.length) {
        const fileName = entries[0].filename
        console.log(fileName)
        const fileText = entries[0].getData(
          // writer
          new zip.TextWriter(),
          // options
          { 
            onprogress: (index, max) => {
               // onprogress callback
            }
          }
        ).then((value) => {
          props.updateFile({fileText: JSON.parse(value), fileName})
          props.updateStatus(true);   
        });
      
      
      }
      
      // close the ZipReader
      reader.close();
    }

  }

  const resetInput = (event) => {
    event.target.value = '';
  }


  return (
    <div>
      <div id='upload-box'>
          {/* <form onSubmit={(event)=>event.preventDefault()}>
              <label htmlFor="fileSelect">Select file (json):</label>
              <input id="fileSelect" type='file' name='tikTokFileJson' accept="application/json" onChange={(e) => handleFileSelection(e, "json")} onClick={resetInput}/>
          </form> */}
          <form onSubmit={(event)=>event.preventDefault()}>
              <label htmlFor="fileSelect">Select file (zip):</label>
              <input id="fileSelect" type='file' name='tikTokFileZip' accept="application/zip" onChange={(e) => handleFileSelection(e, "zip")} onClick={resetInput} />
          </form>
      </div>

      <div id='submission-box'>
          <p>Filename: {props.fileInfo.fileName}</p>
          
      </div>
    </div> 
    )

}

function Anonymizer(props) {
  // in future, check to see if props.fileStatus is true before doing any of this shit


  

  const anonymize = () => {
    const jsonData = props.fileInfo.fileText;
    const videoList = jsonData['Activity']['Video Browsing History']['VideoList'];
    props.setAnonymizedFile({'VideoList':videoList});
  }



  return ( 
    <div>
      <button onClick={anonymize}>Anonymize</button>
    </div>
  )


}

function Sender(props) {

  // const send = () => {

  // }
    
  //   fetch("http://127.0.0.1:5000/receive_anonymized_data", 
  //     {
  //       method: 'POST',
  //       headers: {
  //       'Content-type': 'application/json',
  //       'Accept': 'application/json'
  //       },
  //       body:jsonToSend
  //     }).then(res => {
  //         if (res.ok) {
  //           // display sent successfully!
  //         } else {
  //           alert("something is wrong... refresh and try again")
  //         }
  //     })
  //   }


  let anonymizedTextArea = "";
  let downloadLink = null;
  if (props.anonymizedFile) {
    let anonJsonText = JSON.stringify(props.anonymizedFile, undefined, 4)
    anonymizedTextArea = <pre style={{height: 200, overflow: 'scroll', 'textAlign': 'left'}}>
      {anonJsonText}
    </pre>

    downloadLink =  <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(anonJsonText)}`}
            download="anonymized_tiktok_data.json"
          >
            {`Download Anonymized File`}
          </a>
  }


  
 

  return (
    <div>
      {anonymizedTextArea}
      <div>
        {downloadLink}
      </div>
    </div>
  )
  
}



export default App;
