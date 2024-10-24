package dev.bisher.CodeEditor.service;

import dev.bisher.CodeEditor.controller.CodeRepository;
import dev.bisher.CodeEditor.model.Code;
import dev.bisher.CodeEditor.model.Role;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CodeService {


    private final CodeRepository codeRepository;

    @Autowired
    public CodeService(CodeRepository codeRepository) {
        this.codeRepository = codeRepository;
    }

    public List<Code> allCodes() {
        return codeRepository.findAll();
    }

    public Optional<Code> findCodeById(String id) {
        return codeRepository.findById(id);
    }

    public Code createCode(String codeName, ObjectId creatorId) {
        Code code = codeRepository.insert(new Code());
        code.setCodeName(codeName);
        code.setCreatorId(creatorId);
        code.addPermission(creatorId, Role.EDITOR);
        codeRepository.save(code);
        return code;
    }

    public void deleteCode(String id){
        codeRepository.deleteById(id);
    }

    public Code updateCode(Code code){
        return codeRepository.save(code);
    }

    public Code saveNewCodeVersion(String baseId, ObjectId creatorId){
        Code newVersion = codeRepository.insert(new Code(new ObjectId(baseId)));
        newVersion.setCodeName(getAllVersions(baseId).get(0).getCodeName());
        newVersion.setCreatorId(creatorId);
        newVersion.addPermission(creatorId, Role.EDITOR);
        codeRepository.save(newVersion);
        return newVersion;
    }

    public List<Code> getAllVersions(String baseId){
        return codeRepository.findByOriginalId(new ObjectId(baseId));
    }

    public List<Code> getBaseCodes() {
        List<Code> allCodes = codeRepository.findAll();

        Map<ObjectId, Code> latestCodesMap = new HashMap<>();

        for (Code code : allCodes) {
            ObjectId originalId = code.getOriginalId();

            if (!latestCodesMap.containsKey(originalId) ||
                    code.getVersionDate().isAfter(latestCodesMap.get(originalId).getVersionDate())) {
                latestCodesMap.put(originalId, code);
            }
        }

        return new ArrayList<>(latestCodesMap.values());
    }

    public Optional<Code> assignRole(String codeId, ObjectId userId, Role role){
        String baseId = codeId.split("_")[0];
        List<Code> codes = codeRepository.findByOriginalId(new ObjectId(baseId));
        if (!role.equals(Role.EDITOR) && !role.equals(Role.VIEWER)){
            throw new IllegalArgumentException("The Role you select '"+ role + "' is invalid it must be either 'editor' or 'viewer'");
        }
        for (Code code: codes) {
            code.addPermission(userId, role);
            codeRepository.save(code);
        }
        return codeRepository.findById(codeId);
    }

    public boolean hasPermission(String codeId, ObjectId userId, Role role) {
        Code code = codeRepository.findById(codeId).orElseThrow(() -> new RuntimeException("Code Not Found!"));
        Role userRole = code.getUserRole(userId);
        if (userRole == null) return false;

        return userRole.equals(role) || (role.equals(Role.VIEWER) && userRole.equals(Role.EDITOR));
    }

    public Boolean isOwner(String codeId, ObjectId userId) {
        Code code = codeRepository.findById(codeId).orElseThrow(() -> new RuntimeException("Code Not Found!"));
        return userId.equals(code.getCreatorId());
    }
}
