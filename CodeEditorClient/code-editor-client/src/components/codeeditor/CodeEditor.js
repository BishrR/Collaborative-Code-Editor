import React, { useCallback, useRef } from 'react';
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Link, useParams } from 'react-router-dom';
import TextAreaComponent from '../TextAreaComponent';
import { Modal, Button, Dropdown } from 'react-bootstrap';
// import CodeDiff from '../codediff/CodeDiff';
import { fetchCodeVersions, findDifferences, renderDifferences, checkForConflicts } from '../codediff/CodeDiff';

const CodeEditor = () => {

    let { id } = useParams();
    const [code, setCode] = useState();
    const [output, setOutput] = useState();
    const [saveMessage, setSaveMessage] = useState('');
    const [versions, setVersions] = useState([]);
    let codeArea = null;
    const [errorMessage, setErrorMessage] = useState('');

    const getCode = async () => {
        if (id == null) {
            return;
        }
        try {
            const response = await api.get(`api/v1/codes/${id}`, { withCredentials: true });
            setCode(response.data.codeBody);
        }
        catch (err) {
            if (err.response && err.response.status === 403) {
                alert('You do not have permission to view this code.');
                // setErrorMessage('You do not have permission to view this code.');
            } else {
                console.error('Error fetching code:', err);
            }
        }
    };

    const runCode = async () => {
        try {
            const response = await api.post('api/run-python', { code }, { withCredentials: true });
            setOutput(response.data.output || response.data.error);
        }
        catch (error) {
            console.error('Error running code:', error);
            setOutput("Error running code");
        }
    };

    const saveCode = async () => {
        const codeName = prompt("Enter a name for your code:");
        if (!codeName) {
            setSaveMessage("Code name is required.");
            return;
        }

        try {
            const response = await api.put(`api/v1/codes/update-code/${id}`,
                {
                    codeName: codeName,
                    codeBody: code
                },
                { withCredentials: true }
            );

            console.log('Response from saving code:', response.data);
            setSaveMessage('Code saved successfully!')
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // setErrorMessage('You do not have permission to save this code.');
                alert('You do not have permission to save this code.');
            } else {
                console.error('Error saving code:', error);
                setSaveMessage('Error saving code');
            }
        }
    };

    const socket = new WebSocket("ws://localhost:8080/websocket");

    socket.onopen = function (event) {
        console.log("WebSocket connection established.");
    };

    socket.onmessage = function (event) {
        const messageData = JSON.parse(event.data);
        if (codeArea == null) codeArea = document.getElementById('codeArea');
        codeArea.value = messageData;
        setCode(messageData);
    };

    socket.onerror = function (error) {
        console.error("WebSocket error: ", error);
    };

    socket.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
    };

    function sendMessage(code) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(code));
        } else {
            console.error("WebSocket connection is not open.");
        }
    }

    const getVersions = async () => {
        try {
            const response = await api.get(`api/v1/codes/versions/${id}`, { withCredentials: true })
            // setCodes(response.data)
            setVersions(response.data);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to view this code.');
            } else {
                console.error('Error fetching codes:', error);
            }

        }
    };

    const newVersion = async () => {
        try {
            const response = await api.post(`api/v1/codes/add-new-version/${id}`,
                {
                    codeBody: code
                },
                { withCredentials: true }
            );

            console.log('Response from adding new version:', response.data);
            setSaveMessage('New version saved successfully!')
            getVersions();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to add new version.');
            } else {
                console.error('Error adding new version:', error);
                setSaveMessage('Error adding new version');
            }

        }
    };

    const [selectedVersion1, setSelectedVersion1] = useState(null);
    const [selectedVersion2, setSelectedVersion2] = useState(null);
    const [diffs, setDiffs] = useState([]);
    const [mergeMode, setMergeMode] = useState(false);
    const [codeVersion1, setCodeVersion1] = useState('');
    const [codeVersion2, setCodeVersion2] = useState('');

    const handleVersionSelect = async (versionId, isFirstVersion) => {
        if (isFirstVersion) {
            setSelectedVersion1(versionId);
            if (versionId == null) {
                return;
            }
            try {
                const response = await api.get(`api/v1/codes/${versionId}`, { withCredentials: true });
                setCodeVersion1(response.data.codeBody);
            }
            catch (error) {
                if (error.response && error.response.status === 403) {
                    alert('You do not have permission to view this code.');
                } else {
                    console.log('Error fetching codeVersion1:', err);
                }

            }
        } else {
            setSelectedVersion2(versionId);
            if (versionId == null) {
                return;
            }
            try {
                const response = await api.get(`api/v1/codes/${versionId}`, { withCredentials: true });
                setCodeVersion2(response.data.codeBody);
            }
            catch (error) {
                if (error.response && error.response.status === 403) {
                    alert('You do not have permission to view this code.');
                } else {
                    console.log('Error fetching codeVersion:', err);

                }
            }
        }
    };

    const handleCompareVersions = async () => {
        if (selectedVersion1 && selectedVersion2) {
            await fetchCodeVersions(selectedVersion1, selectedVersion2, setCodeVersion1, setCodeVersion2);
            const diffs = findDifferences(codeVersion1, codeVersion2);
            setDiffs(diffs);
            setMergeMode(true);
            const conflictExists = checkForConflicts(diffs);
            setConflictDetected(conflictExists);
        }
    };

    const handleMerge = async (decision) => {
        if (decision === 'save') {
            let mergedCode = document.getElementById('codeMerged');;
            if (mergedCode !== null) {
                setCode(mergedCode.value);
                id = selectedVersion1;
                saveCode();
            }
            refreshPage();
        } else if (decision === 'cancel') {
            setMergeMode(false);
            refreshPage();
        }
    };

    const [conflictDetected, setConflictDetected] = useState(false);
    const [resolvingConflict, setResolvingConflict] = useState(false);

    const handleResolveConflict = () => {
        setResolvingConflict(true);
        setValue(
            '######### Start of Code 1 #########' + '\n' + codeVersion1 + '\n' + '######### End of Code 1 #########' + '\n\n' +
            '######### Start of Code 2 #########' + '\n' + codeVersion2 + '\n' + '######### End of Code 2 #########'
        )
        // setCode(diffs);
    };

    useEffect(() => {
        checkOwnership();
        getCode();
        codeArea = document.getElementById('codeArea');
        getVersions();
    }, [id])

    function refreshPage() {
        window.location.reload(false);
    }

    const [value, setValue] = useState();
    const handleChange = (event) => {
        setValue(event.target.value);
        console.log("HANDLE CHAAAAAANGE:", event.target.value);
    };

    const [isOwner, setIsOwner] = useState(false);
    const checkOwnership = async () => {
        try {
            const response = await api.get(`/api/v1/codes/${id}/owner`, { withCredentials: true });
            setIsOwner(response.data);
        } catch (error) {
            setErrorMessage('Failed to check code ownership');
            console.error('Error checking ownership:', error);
        }
    };

    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('VIEWER');
    const [email, setEmail] = useState(''); 
    

    const handleOpenModal = () => setShowShareModal(true);
    const handleCloseModal = () => setShowShareModal(false);
    const assignRole = async (email, role) => {
        console.log(email);
        console.log(role);
        try {
            const response = await api.post(
                `/api/v1/codes/${id}/assign-role`,
                null,
                {
                    params: {
                        email: email,
                        role: role
                    },
                    withCredentials: true
                }
            );

            console.log("RESPONSE:", response);
            console.log('Role assigned successfully:', response.data);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to assign roles.');
                // setErrorMessage('You do not have permission to assign roles.');
            } else if (error.response && error.response.status === 404) {
                alert('User Not Found!!!');
            } else {
                console.error('Error assigning role:', error);
            }
        };
    };

    if (errorMessage) {
        return (
            <div>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            </div>
        )
    };

    if (code) {
        return (
            <div>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}


                <Dropdown>
                    <Dropdown.Toggle variant='success' id='dropdown-versions'>
                        Versiosns
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {versions.map((version, index) => (
                            <Dropdown.Item
                                key={index}
                                onClick={() => handleVersionSelect(version.id, true)}
                            >
                                <Link to={`code-editor/${version.id}`}>
                                    {version.id}
                                </Link>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle variant='success' id='dropdown-versions2'>
                        Versiosns2
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {versions.map((version, index) => (
                            <Dropdown.Item
                                key={index}
                                onClick={() => handleVersionSelect(version.id, false)}
                            >
                                <Link to={`code-editor/${version.id}`}>
                                    {version.id}
                                </Link>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <TextAreaComponent sendToSocket={sendMessage} initialValue={code} />
                {/* Button to Compare Versions */}
                <button onClick={handleCompareVersions}>Compare Versions</button>

                {isOwner && (
                    <div>
                        {/* Share Button */}
                        <Button variant="primary" onClick={handleOpenModal}>
                            Share Code
                        </Button>

                        {/* Modal for Sharing Code */}
                        <Modal show={showShareModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Share Code</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>
                                    {/* Dropdown to Select Role */}
                                    <Dropdown onSelect={(e) => setSelectedRole(e)}>
                                        <Dropdown.Toggle variant="success" id="dropdown-role">
                                            Share as {selectedRole}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item eventKey="VIEWER">Viewer</Dropdown.Item>
                                            <Dropdown.Item eventKey="EDITOR">Editor</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    {/* Input for Email */}
                                    <label htmlFor="email">User Email:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter user email"
                                        className="form-control"
                                    />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={() => {
                                    assignRole(email, selectedRole); // Call the assignRole function
                                    handleCloseModal(); // Close the modal after submission
                                }}>
                                    Share
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )}



                {/* Show Differences */}
                {mergeMode && (
                    <div>
                        <h3>Code Differences</h3>
                        <div>{renderDifferences(diffs)}</div>

                        {/* Check for conflicts */}
                        {conflictDetected && (
                            <div>
                                <h4>Conflict Detected!</h4>
                                <p>Do you want to resolve it manually?</p>
                                <button onClick={handleResolveConflict}>Resolve Conflict</button>
                                <button onClick={() => handleMerge('cancel')}>Cancel Merge</button>
                            </div>
                        )}

                        {!conflictDetected && (
                            <div>
                                <h4>No Conflict Detected!</h4>
                                <p>Do you want to merge?</p>
                                <button onClick={() => handleMerge('save')}>Merge Code</button>
                                <button onClick={() => handleMerge('cancel')}>Cancel Merge</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Conflict Resolution */}
                {resolvingConflict && (
                    <div>
                        <h3>Resolve Conflict</h3>
                        <textarea
                            id='codeMerged'
                            value={value}
                            onChange={handleChange}
                            autoFocus
                            cols={100}
                        />
                        <button onClick={runCode}>Run Merged Code</button>
                        <button onClick={() => handleMerge('save')}>Meeeeeeerge</button>

                    </div>
                )}

                <div>
                    <button onClick={runCode}>Run Code</button>
                    <button onClick={saveCode}>Save Code</button>
                    <button onClick={newVersion}>New Version</button>
                    <div id='messages'></div>
                    <pre>{output}</pre>
                    <p>{saveMessage}</p>
                </div>

            </div>
        )
    }
    else return <div>Loading</div>

    // return (
    //     <div>
    //         <h2>Code Editor</h2>

    //         {/* Version Dropdowns */}
    //         <Dropdown>
    //             <Dropdown.Toggle variant="success" id="dropdown-version1">
    //                 Select Version 1
    //             </Dropdown.Toggle>
    //             <Dropdown.Menu>
    //                 {versions.map((version) => (
    //                     <Dropdown.Item key={version.id} onClick={() => handleVersionSelect(version.id, true)}>
    //                         {version.id}
    //                     </Dropdown.Item>
    //                 ))}
    //             </Dropdown.Menu>
    //         </Dropdown>

    //         <Dropdown>
    //             <Dropdown.Toggle variant="success" id="dropdown-version2">
    //                 Select Version 2
    //             </Dropdown.Toggle>
    //             <Dropdown.Menu>
    //                 {versions.map((version) => (
    //                     <Dropdown.Item key={version.id} onClick={() => handleVersionSelect(version.id, false)}>
    //                         {version.id}
    //                     </Dropdown.Item>
    //                 ))}
    //             </Dropdown.Menu>
    //         </Dropdown>


    //         {/* Button to Compare Versions */}
    //         <button onClick={handleCompareVersions}>Compare Versions</button>

    //         {/* Show Differences */}
    //         {mergeMode && (
    //             <div>
    //                 <h3>Code Differences</h3>
    //                 <div>{renderDifferences(diffs)}</div>

    //                 {/* Merge or Cancel Buttons */}
    //                 <div>
    //                     <button onClick={() => handleMerge('save')}>Save Merged Code</button>
    //                     <button onClick={() => handleMerge('cancel')}>Cancel Merge</button>
    //                 </div>
    //             </div>
    //         )}

    //         {/* Text Editor */}
    //         <textarea value={code} onChange={(e) => setCode(e.target.value)} />

    //         {/* Run & Save Buttons */}
    //         <div>
    //             <button onClick={() => runCode()}>Run Code</button>
    //             <button onClick={() => saveCode()}>Save Code</button>
    //             <div id="messages"></div>
    //             <pre>{output}</pre>
    //             <p>{saveMessage}</p>
    //         </div>
    //     </div>
    // );
};

export default CodeEditor