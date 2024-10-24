package dev.bisher.CodeEditor.model;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "codes")
@Data
@AllArgsConstructor
@Getter
@Setter
public class Code {

    @Id
    private String id;
    private ObjectId originalId;
    private String codePath;
    private String codeName;
    private LocalDateTime versionDate;


    private ObjectId creatorId;
    private Map<ObjectId, Role> userPermissions;


    public Code(){
        this.originalId = new ObjectId();
        this.versionDate = LocalDateTime.now();
        this.id = generateVersionedId();
        this.userPermissions = new HashMap<>();

    }

    public Code (ObjectId originalId){
        this.originalId = originalId;
        this.versionDate = LocalDateTime.now();
        this.id = generateVersionedId();
        this.userPermissions = new HashMap<>();
    }

    public String generateVersionedId(){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
        String dateFormatted = versionDate.format(formatter);
        return originalId.toString() + "_"+ dateFormatted;
    }

    public String getId() {
        return id != null ? id : null;
    }

    public String getCodePath() {
        return codePath;
    }

    public void setCodePath(String codePath) {
        this.codePath = codePath;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
        setCodePath("/usr/src/app/codes/"+getId());
    }

    public ObjectId getOriginalId() {
        return originalId;
    }

    public void setOriginalId(ObjectId originalId) {
        this.originalId = originalId;
    }

    public LocalDateTime getVersionDate() {
        return versionDate;
    }

    public void setVersionDate(LocalDateTime versionDate) {
        this.versionDate = versionDate;
    }

    public void addPermission(ObjectId userId, Role role) {
        userPermissions.put(userId, role); // Add or update user permissions
    }

    public Role getUserRole(ObjectId userId) {
        return userPermissions.get(userId);
    }

    public ObjectId getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(ObjectId creatorId) {
        this.creatorId = creatorId;
    }
}
