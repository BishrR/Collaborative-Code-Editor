import React, { useCallback, useRef } from 'react';
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';
import Console from './Console';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import TextAreaComponent from '../TextAreaComponent';
// import { Editor } from '@monaco-editor/react';
// import * as Y from "yjs"
// import { WebrtcProvider } from 'y-webrtc';
// import { MonacoBinding } from 'y-monaco';


const oldCodeEditor = () => {

    const { id } = useParams();
    const [code, setCode] = useState();
    const [output, setOutput] = useState();
    const [saveMessage, setSaveMessage] = useState('');
    // const [connected, setConnected] = useState(false);
    // let stompClient = null;
    let codeArea = null;

    // console.log('EDITOR IDDDDDDDDDDD:', id);
    const getCode = async () => {
        try {
            const response = await api.get(`api/v1/codes/${id}`, { withCredentials: true });
            setCode(response.data.codeBody);
        }
        catch (err) {
            console.log('Error fetching code:', err);
        }
    }

    const runCode = async () => {
        try {
            const response = await api.post('api/run-python', { code }, { withCredentials: true });
            // console.log('Response from running code:', response.data);
            setOutput(response.data.output || response.data.error);
        }
        catch (error) {
            console.error('Error running code:', error);
            setOutput("Error running code");
        }
    };

    const handleUserInput = async (userInput) => {
        try {
            const response = await api.post('api/run-python', { code, userInput }, { withCredentials: true });
            setOutput(response.data.output || response.data.error);
        } catch (error) {
            setOutput("Error running code with user input");
        }
    }

    const saveCode = async () => {
        try {
            const response = await api.put(`api/v1/codes/update-code/${id}`, { codeBody: code }, { withCredentials: true });
            console.log('Response from saving code:', response.data);
            setSaveMessage('Code saved successfully!')
        } catch (error) {
            console.error('Error saving code:', error);
            setSaveMessage('Error saving code');
        }
    };

    const socket = new WebSocket("ws://localhost:8080/websocket");

    socket.onopen = function(event) {
        console.log("WebSocket connection established.");
    };
    
    socket.onmessage = function(event) {
        const messageData = JSON.parse(event.data);   
        if (codeArea == null) codeArea = document.getElementById('codeArea');
        codeArea.value = messageData;    
    };
    
    socket.onerror = function(error) {
        console.error("WebSocket error: ", error);
    };
    
    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
    };
    
    function sendMessage(code) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(code));
        } else {
            console.error("WebSocket connection is not open.");
        }
    }
        

    // const stompClient = new Client({
    //     brokerURL: 'ws://localhost:8080/ws/websocket',
    //     onConnect: () => {
    //         stompClient.subscribe('/topic/code', codeMessage => {
    //             console.log("Messaaaaaaaaaaaage: " + JSON.parse(codeMessage.body).codeBody);                
    //         });
            
    //         // var code = "123";        
    //         // stompClient.publish({ destination: '/app/edit-code', body: JSON.stringify({'codeBody':code}) });       ;
    //     },
    //     debug: (str) => {console.log(str)}
    // });

    // function connect() {
    //     stompClient.activate();      
    // }



    // function sendCode() {        
    //     var code = document.getElementById("codeArea").value;        
    //     stompClient.publish({ destination: '/app/edit-code', body: JSON.stringify({'codeBody':code}) });        
    // }

    // function showMessage(message){
    //     var messageDiv = document.getElementById("messages");
    //     var messageElement = document.createElement("p");
    //     messageElement.appendChild(document.createTextNode(message));
    //     messageDiv.appendChild(messageElement);
    // }

    // window.onload = function() {
    //     connect();
    // }
//************************************************************************* */
    // const socket = new WebSocket("ws://localhost:8080/ws")

    // socket.addEventListener("edit-code", event =>{
    //     socket.send("Connection established")
    // });

    // socket.addEventListener("topic/code", event =>{
    //     console.log("Message from server ", event.data)
    // });
//************************************************************************* */
    // const connectWebSocket = () => {
    //     // const socket = new SockJS('http://localhost:8080/ws');
    //     // stompClient = over(socket);

    //     // stompClient.connect({}, onConnected, onError);

    //     stompClient.connect({}, (frame) =>{
    //         console.log('Connected: '+ frame);

    //         stompClient.subscribe('/topic/code', (message) =>{
    //             const updateCode = JSON.parse(message.body).codeBody;
    //             setCode(updateCode);
    //         });
    //     });
    // };

    // const onConnected = () => {
    //     setConnected(true);
    //     stompClient.subscribe('/topic/code', onCodeReceived);
    // };

    // const onError = (err) => {
    //     console.log('WebSocket error:', err);
    // };

    // const onCodeReceived = (message) => {
    //     setCode(message.body);
    // };

    // const sendCodeUpdate = (newCode) => {
    //     if(stompClient && connected){
    //         stompClient.send('/app/edit-code', {}, JSON.stringify({codeBody:newCode}));
    //         // stompClient.send('/app/edit-code', {}, newCode);
    //     }
    // };

    // const handleChange = (e) => {
    //     const updatedCode = e.target.value;
    //     setCode(updatedCode);
    //     sendMessage(updatedCode)
    //     useCallback(
    //         _.th
    //     , [])
    // };




    useEffect(() => {

        getCode();        
        codeArea = document.getElementById('codeArea');
    }, [id])


    

    if (code) {
        return (
            <div>
                {/* <textarea
                    id='codeArea'
                    value={code}
                    // onChange={(e) => { setCode(e.target.value) }}
                    onChange={handleChange}
                    // onChange={(e) => {
                    //     setCode(e.target.value);
                    //     sendCodeUpdate(e.target.value);
                    // }}
                    autoFocus
                    cols={100}
                /> */}

                <TextAreaComponent sendToSocket={sendMessage} initialValue={code} />

                <button onClick={runCode}>Run Code</button>
                <button onClick={saveCode}>Save Code</button>
                <button onClick={sendMessage}>Send Code</button>
                <div id='messages'></div>
                <pre>{output}</pre>
                {/* <Console output={output} onUserInput={handleUserInput} /> */}
                {/* <Console output={output}/> */}
                <p>{saveMessage}</p>
            </div>
        )
    }
    else return <div>Loading</div>

    // const editorRef = useRef(null);
    // function handleEditorDidMount(editor, monaco){
    //     editorRef.current = editor;
    //     const doc = new Y.Doc();
    //     const provider = new WebrtcProvider("test-room", doc);
    //     const type = doc.getText("monaco");

    //     const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    //     console.log(provider.awareness);
    // }
    // return (
    //     <Editor
    //         height="100vh"
    //         width="100vh"
    //         theme="vs-dark"
    //         onMount={handleEditorDidMount}
    //     />
    // )

}

export default oldCodeEditor