package dev.bisher.CodeEditor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FileSystemService {

    @Value("${file-system-service.url}")
    private String fileSystemServiceUrl;

    @Autowired
    private final RestTemplate restTemplate;


    public FileSystemService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void saveCodeToFileSystem(String codePath, String codeBody) {

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("codePath", codePath);
        requestBody.put("codeBody", codeBody);

        System.out.println("FFFFIIIIIIIIILESYSTEMURLLLL: "+ fileSystemServiceUrl);
        System.out.println("REQQQQQQQUEEEESTBOOOODYYYYY: "+ requestBody);
        try {
            ResponseEntity<String> o = restTemplate.postForEntity(fileSystemServiceUrl + "/save-code", requestBody, String.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RestClientException("Failed to save code to the file system", e);
        }
    }

    public String getCodeFromFileSystem(String id) {
        try {
            return String.valueOf(restTemplate.getForEntity(fileSystemServiceUrl + "/get-code/" + id, String.class).getBody());
        }catch (Exception e){
            throw new RestClientException("Failed to get code from the file system", e);
        }

    }

    public void updateCodeInFileSystem(String id, String codeName, String codeBody){
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("codeName", codeName);
        requestBody.put("codeBody", codeBody);

        try {
            restTemplate.put(fileSystemServiceUrl+"/update-code/"+id, requestBody, String.class);
        }catch (Exception e){
            throw new RestClientException("Failed to update code in the file system", e);
        }
    }

    public void deleteCodeFromFileSystem(String id){
        try {
            restTemplate.delete(fileSystemServiceUrl+"/delete-code/"+id);
        }catch (Exception e){
            throw new RestClientException("Failed to delete code!", e);
        }
    }

}
