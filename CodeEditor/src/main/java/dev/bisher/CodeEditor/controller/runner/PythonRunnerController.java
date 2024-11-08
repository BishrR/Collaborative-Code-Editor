package dev.bisher.CodeEditor.controller.runner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PythonRunnerController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${EC2_PUBLIC_IP}")
    private String ec2PublicIp;

    @PostMapping("/run-python")
    public ResponseEntity<Map<String, String>> runPythonCode(@RequestBody Map<String, String> request){
        String code = request.get("code");

//        String dockerUrl = "http://localhost:5000/run";
        String dockerUrl = "http://" + ec2PublicIp + ":5000/run";
        Map<String, String> pythonRequest = new HashMap<>();
        pythonRequest.put("code", code);

        try {
            ResponseEntity<Map> dockerResponse = restTemplate.postForEntity(dockerUrl, pythonRequest, Map.class);

            Map<String, String> result = new HashMap<>();
            result.put("output", (String) dockerResponse.getBody().get("output"));
            result.put("error", (String) dockerResponse.getBody().get("error"));

            return ResponseEntity.ok(result);
        }catch (Exception e){
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to run the Python code "+e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
