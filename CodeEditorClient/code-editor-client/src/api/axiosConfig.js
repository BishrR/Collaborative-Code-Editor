import axios from 'axios';

export default axios.create({
    // baseURL: 'http://localhost:8080/',
    baseURL: 'http://b4r-c11e-c2e-e4r-m4r-931744921.us-east-1.elb.amazonaws.com:8080'
    // headers: {"ngrok-skip-browser-warning": "true"}
});
