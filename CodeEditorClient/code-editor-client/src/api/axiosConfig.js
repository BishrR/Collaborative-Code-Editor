import axios from 'axios';

const ec2PublicIp = process.env.EC2_PUBLIC_IP;

export default axios.create({
    // baseURL: 'http://localhost:8080/',
    baseURL: 'http://' + ec2PublicIp + ':8080'
    // headers: {"ngrok-skip-browser-warning": "true"}
});
