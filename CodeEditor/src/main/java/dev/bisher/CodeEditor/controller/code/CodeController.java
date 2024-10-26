package dev.bisher.CodeEditor.controller.code;

import dev.bisher.CodeEditor.model.code.CodeUpdatePayLoad;
import dev.bisher.CodeEditor.model.code.Code;
import dev.bisher.CodeEditor.model.code.CodeMessage;
import dev.bisher.CodeEditor.model.code.CodeResponse;
import dev.bisher.CodeEditor.model.role.Role;
import dev.bisher.CodeEditor.model.user.User;
import dev.bisher.CodeEditor.service.code.CodeService;
import dev.bisher.CodeEditor.service.file.FileSystemService;
import dev.bisher.CodeEditor.service.user.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/codes")
public class CodeController {


    @Value("${file-system-service.dirPath}")
    private String fileSystemServiceDirPath;

    private final CodeService codeService;
    private final FileSystemService fileSystemService;
    private final UserService userService;

    @Autowired
    public CodeController(CodeService codeService, FileSystemService fileSystemService, UserService userService) {
        this.codeService = codeService;
        this.fileSystemService = fileSystemService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<CodeResponse>> getAllCodes() {
        List<Code> codes = codeService.allCodes();
        List<CodeResponse> response = codes.stream()
                                            .map(CodeResponse::new)
                                            .collect(Collectors.toList());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/base-codes")
    public ResponseEntity<List<CodeResponse>> getAllBaseCodes(){
        List<Code> baseCodes = codeService.getBaseCodes();
        List<CodeResponse> response = baseCodes.stream()
                                                .map(CodeResponse::new)
                                                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/versions/{id}")
    public ResponseEntity<List<CodeResponse>> getAllVersionCodes(@PathVariable String id, @AuthenticationPrincipal User user){
        if (!codeService.hasPermission(id, user.getObjectId(), Role.VIEWER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String baseId = id.split("_")[0];
        List<Code> allVersions = codeService.getAllVersions(baseId);
        List<CodeResponse> response = allVersions.stream()
                .map(CodeResponse::new)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CodeMessage> getCodeById(@PathVariable String id, @AuthenticationPrincipal User user) {
        if (!codeService.hasPermission(id, user.getObjectId(), Role.VIEWER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return new ResponseEntity<>(new CodeMessage(fileSystemService.getCodeFromFileSystem(id)), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/add-code")
    public ResponseEntity<Code> createCode(@RequestBody Map<String, String> payLoad, @AuthenticationPrincipal User creator) {
        System.out.println("CCREAAAAAAAAAAAAAATORRRRRRRR: "+ creator.getEmail());
        if (creator ==null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Code code = codeService.createCode(payLoad.get("codeName"), creator.getObjectId());
        String codePath = fileSystemServiceDirPath+"/"+code.getId();
        System.out.println("COOOOOOOOOOOOOOOODE PAAAAAAAATH: "+ codePath);
        System.out.println("COOOOOOOOOOOOOOOODE BOOOODYYYYY: "+ payLoad.get("codeBody"));
        try {
            fileSystemService.saveCodeToFileSystem(codePath, payLoad.get("codeBody"));
            return new ResponseEntity<>(code, HttpStatus.CREATED);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete-code/{id}")
    public ResponseEntity<String> deleteCode(@PathVariable String id, @AuthenticationPrincipal User user) {
        if (!codeService.isOwner(id, user.getObjectId())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Code> code = codeService.findCodeById(id);
        if (code.isEmpty()) {
            return new ResponseEntity<>("Code Not Found!!!", HttpStatus.BAD_REQUEST);
        }
        codeService.deleteCode(id);
        try {
            fileSystemService.deleteCodeFromFileSystem(code.get().getId());
            return new ResponseEntity<>("Code deleted Successfully.", HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>("Error while deleting code from file system", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PutMapping("/update-code/{id}")
    public ResponseEntity<String> updateCode(@PathVariable String id, @RequestBody CodeUpdatePayLoad codeUpdatePayLoad, @AuthenticationPrincipal User user) {
        if (!codeService.hasPermission(id, user.getObjectId(), Role.EDITOR)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Code> code = codeService.findCodeById(id);
        if (code.isEmpty()) {
            return new ResponseEntity<>("Code Not Found!!!", HttpStatus.BAD_REQUEST);
        }

        code.ifPresent(c -> {
            c.setCodeName(codeUpdatePayLoad.getCodeName());
            codeService.updateCode(c);
        });

        try {
            fileSystemService.updateCodeInFileSystem(code.get().getId(), codeUpdatePayLoad.getCodeName(), codeUpdatePayLoad.getCodeBody());
            return new ResponseEntity<>("Code Successfully Updated", HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>("Error while updating code in file system", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/add-new-version/{id}")
    public ResponseEntity<Code> addNewVersion(@PathVariable String id, @RequestBody CodeUpdatePayLoad codeUpdatePayLoad, @AuthenticationPrincipal User user){
        if (!codeService.hasPermission(id, user.getObjectId(), Role.EDITOR)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Code> oldVersion = codeService.findCodeById(id);
        if (oldVersion.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String baseId = id.split("_")[0];
        Code newVersion = codeService.saveNewCodeVersion(baseId, user.getObjectId());
        String codePath = fileSystemServiceDirPath+"/"+newVersion.getId();
        try {
            fileSystemService.saveCodeToFileSystem(codePath, codeUpdatePayLoad.getCodeBody());
            return new ResponseEntity<>(newVersion, HttpStatus.CREATED);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/merge")
    public  ResponseEntity<Code> mergeCode(@PathVariable String id,@RequestBody CodeUpdatePayLoad codeUpdatePayLoad, @AuthenticationPrincipal User user){
        if (!codeService.hasPermission(id, user.getObjectId(), Role.EDITOR)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Code> oldVersion = codeService.findCodeById(id);
        if (oldVersion.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String baseId = id.split("_")[0];
        Code newVersion = codeService.saveNewCodeVersion(baseId, user.getObjectId());
        String codePath = fileSystemServiceDirPath+"/"+newVersion.getId();
        try {
            fileSystemService.saveCodeToFileSystem(codePath, codeUpdatePayLoad.getCodeBody());
            return new ResponseEntity<>(newVersion, HttpStatus.CREATED);
        } catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/assign-role")
    public ResponseEntity assignRole(
            @PathVariable String id,
            @RequestParam String email,
            @RequestParam Role role,
            @AuthenticationPrincipal User editor) {
        if (!codeService.hasPermission(id, editor.getObjectId(), Role.EDITOR)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> user = userService.getUserByEmail(email);
        if (user.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        ObjectId userId = user.get().getObjectId();
        codeService.assignRole(id, userId, role);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping("/{codeId}/owner")
    public ResponseEntity<Boolean> isCodeOwner(@PathVariable String codeId, @AuthenticationPrincipal User user){
        if (codeService.isOwner(codeId, user.getObjectId())){
            return new ResponseEntity<>(true, HttpStatus.OK);
        }else {
            return new ResponseEntity<>(false, HttpStatus.OK);
        }
    }

}