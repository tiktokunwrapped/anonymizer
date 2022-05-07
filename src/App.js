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
      <div>
      <p>Please select and then anonymize a file using the interface below.</p>
      <p>You will be able to inspect your anonymized file before deciding to save it to your local device or send it to us.</p>
      </div>

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

  const [sending, setSending] = useState(false)


  let anonymizedTextArea = "";
  let toSubmit = "placeholder";
  let downloadLink = null;
  if (props.anonymizedFile && !sending) {
    let anonJsonText = JSON.stringify(props.anonymizedFile, undefined, 4)
    anonymizedTextArea = <pre style={{height: 200, overflow: 'scroll', 'textAlign': 'left'}}>
      {anonJsonText}
    </pre>

    const dataUrl = URL.createObjectURL(new Blob([anonJsonText], {type:'text/plain'}));
    downloadLink =  <a
            href={dataUrl}
            download="anonymized_tiktok_data.json"
          >
            {'Save data to local device'}
          </a>

    toSubmit = JSON.stringify(props.anonymizedFile);  

    return (
      <div>
        {/* <div> */}
          {/* <form id="fs-frm" name="simple-contact-form" accept-charset="utf-8" action="https://formspree.io/f/mpzbjvdo" method="post" >
            <fieldset id="fs-frm-inputs" hidden>
            <label for="message" hidden></label>
              <textarea rows="5" name="message" id="message" required="" value={toSubmit} hidden></textarea>
              <input type="hidden" name="_subject" id="email-subject" value="Contact Form Submission" hidden></input>
            </fieldset>
          </form> */}
        {/* </div> */}
        <div style={{'display': 'inline'}}>
          <button type="submit" value="Submit" form="fs-frm" onClick={(e) => {e.currentTarget.innerText = 'Sending... do not close'}}>Send data to secure server</button>
          <button type="submit" value="Save Anonymized File" >{downloadLink}</button>
        </div>
        <div>
          You can preview the anonymized file below before you decide to save it to your computer. (warning - it may be quite long, and may be slow on some browsers.)
          {anonymizedTextArea}
        </div>
      </div>
    )

  } else {
    return (
      <div> </div>
    )
  }
  
}



export default App;
