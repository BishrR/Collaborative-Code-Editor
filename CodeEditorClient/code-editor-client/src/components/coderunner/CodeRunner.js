import React, { useState } from "react";
import api from '../../api/axiosConfig';
import { Button } from "bootstrap";

const CodeRunner = () =>{
    const [code, setCode] = useState();
    const [output, setOutput] = useState();

    const runCode = async () => {
        try{
            const response = await api.post('api/run-python', {code}, { withCredentials: true });
            setOutput(response.data.output || response.data.error);
        }
        catch(error){
            setOutput("Error running code");
        }
    };

    return(
        <div>
            <textarea rows="10" cols="50" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Write your code here"/>
            <button onClick={runCode}>Run Code</button>
            <pre>{output}</pre>
        </div>
    )


};

export default CodeRunner;