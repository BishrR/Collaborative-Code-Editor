import React, { useState } from 'react'

const Console = ({ output, onUserInput }) => {
    const [userInput, setUserInput] = useState();

    const handleUserInput = () => {
        if (onUserInput && userInput) {
            onUserInput(userInput);
            setUserInput('');
        }
    };

    return (
        <div className='console'>
            <pre>{output}</pre>

            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter input..."
            />
            <button onClick={handleUserInput}>Submit Input</button>
        </div>
    )
}

export default Console