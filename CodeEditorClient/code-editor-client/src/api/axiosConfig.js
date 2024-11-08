import axios from 'axios';

export default axios.create({
    // baseURL: 'http://localhost:8080/',
    baseURL: 'http://code-editor:8080'
    // headers: {"ngrok-skip-browser-warning": "true"}
});
