import React from 'react';
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';


const CodeList = () => {

    const [codes, setCodes] = useState([]);
    const [newCodeName, setNewCodeName] = useState('');
    const [deleteMessage, setDeleteMessge] = useState('');

    const getCodes = async () => {
        try {
            const response = await api.get('api/v1/codes', { withCredentials: true })
            setCodes(response.data)
        } catch (error) {
            console.error('Error fetching codes:', error);
        }
    };

    const getBaseCodes = async () => {
        try {
            const response = await api.get('api/v1/codes/base-codes', { withCredentials: true })
            setCodes(response.data)
        } catch (error) {
            console.error('Error fetching codes:', error);
        }
    };

    const addNewCode = async () => {
        const codeName = prompt('Enter the name for the new code file:');
        if(codeName){
            try {
                const newCode = {
                    codeName,
                    codeBody: 'print("Hi, welcome to my code editor!")'
                };
                const response = await api.post('api/v1/codes/add-code', newCode, {withCredentials:true});
                console.log('Code added:', response.data);
                // getCodes();
                getBaseCodes();
            } catch (error) {
                console.error('Error adding code:'+ error);
            }
        }
    };

    const deleteCode = async (id) => {
        const confirmation = prompt('Type "delete" to confirm deletion:');
        if (confirmation === 'delete'){
            try {
                await api.delete(`/api/v1/codes/delete-code/${id}`, {withCredentials:true});
                setDeleteMessge('Code deleted successfully.');
                // getCodes();
                getBaseCodes();
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    alert('You do not have permission to delete this code.');
                }else {
                    console.error('Error deleting code:', error);
                    setDeleteMessge('Error deleting code.');
                }
                
            }
        } else {
            setDeleteMessge('You did not type "delete"! Code deletion cancelled.');
        }
    };

    useEffect(() => {
        // getCodes();
        getBaseCodes();
    }, []);

    return (
        <div>
            <h1>Code List</h1>
            <button onClick={addNewCode}>New Code</button>

            <ul>
                {codes.map((code, index) => (
                                
                    <li key={index}>    
                        <Link to={`code-editor/${code.id}`}> 
                        {code.codeName}
                        </Link>
                        <button onClick={() => deleteCode(code.id)}>Delete</button>
                    </li>

                ))}
            </ul>

            {deleteMessage && <p>{deleteMessage}</p>}
        </div>
    )
}

export default CodeList