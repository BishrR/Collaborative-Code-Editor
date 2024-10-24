import { useState, useEffect, useRef } from "react";

const TextAreaComponent = ({ sendToSocket, initialValue }) => {
  const [text, setText] = useState(initialValue);
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout for 0.5 seconds
    timeoutRef.current = setTimeout(() => {
      sendToSocket(e.target.value);
    }, 500);
  };

  // Clean up the timeout when the component unmounts
  useEffect(() => {
    setText(initialValue);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [initialValue]);

  return (
    <textarea
        id='codeArea'
      value={text}
      onChange={handleChange}
      placeholder="Type something..."
      cols={70}
    />
  );
};

export default TextAreaComponent;
