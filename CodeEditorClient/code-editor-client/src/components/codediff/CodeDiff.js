import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { diff_match_patch } from 'diff-match-patch';
import React from 'react'

// const CodeDiff = () => {
    // const [codeVersion1, setCodeVersion1] = useState("");
    // const [codeVersion2, setCodeVersion2] = useState("");

    const fetchCodeVersions = async (version1Id, version2Id, setCodeVersion1, setCodeVersion2) =>  {
        try {
            const response1 = await api.get(`api/v1/codes/${version1Id}`, { withCredentials: true });
            const response2 = await api.get(`api/v1/codes/${version2Id}`, { withCredentials: true });
            setCodeVersion1(response1.data.codeBody);
            setCodeVersion2(response2.data.codeBody);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to fetch this code.');
            }
            else {
                console.error('Error fetching code versions:', err);
            }
        }
    };

    const dmp = new diff_match_patch();

    const findDifferences = (code1, code2) => {
        // console.log("CODE 1:", code1);
        // console.log("CODE 2:", code2);
        const diff = dmp.diff_main(code1, code2);
        // console.log("diff1: ", diff);
        dmp.diff_cleanupSemantic(diff);
        // console.log("diff2: ", diff);
        return diff;
    };

    const checkForConflicts = (diffs) => {
        return diffs.some((part) => part[0] === diff_match_patch.DIFF_DELETE);
    };

    const renderDifferences = (diffs) => {
        return diffs.map((part, index) => {
            const [operation, text] = part;
            if (operation === diff_match_patch.DIFF_INSERT) {
                return <span key={index} style={{ backgroundColor: 'lightgreen' }}>+{text}</span>;
            } else if (operation === diff_match_patch.DIFF_DELETE) {
                return <span key={index} style={{ backgroundColor: 'lightcoral' }}>-{text}</span>;
            } else {
                return <span key={index}>{text}</span>;
            }
        });
    };

    // const [mergedCode, setMergedCode] = useState("");

    // const handleSaveMergedCode = async () => {
    //     try {
    //         const response = await api.post('api/v1/codes/merge', { mergedCode }, { withCredentials: true });
    //         console.log('Merge saved successfully', response.data);
    //     } catch (error) {
    //         console.error('Error saving merged code:', error);
    //     }
    // };

    // const handleCancelMerge = () => {
    //     setMergedCode("");
    // };


// }
// export default CodeDiff 
export { fetchCodeVersions, findDifferences, renderDifferences, checkForConflicts };


