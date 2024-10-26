package dev.bisher.CodeEditor;

import dev.bisher.CodeEditor.repository.CodeRepository;
import dev.bisher.CodeEditor.model.code.Code;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.annotation.Rollback;
import java.util.List;
import java.util.Optional;

@DataMongoTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CodeRepositoryUnitTests {

    @Autowired
    private CodeRepository codeRepository;


    @Test
    @DisplayName("Test 1:Save Code Test")
    @Order(1)
    @Rollback(value = false)
    public void saveCodeTest(){

        Code code  =new Code();
        code.setCodeName("Code 1");
        codeRepository.save(code);

        //Verify
        Assertions.assertEquals("Code 1", codeRepository.findById(code.getId()).get().getCodeName());
    }

    @Test
    @Order(2)
    public void getCodeTest(){

        //Action
        Code code = codeRepository.findById("6719274f34dea1082bc0bf9e_20241023_164151").get();
        //Verify
        Assertions.assertEquals("6719274f34dea1082bc0bf9e_20241023_164151", code.getId());
    }

    @Test
    @Order(3)
    public void getListOfCodesTest(){
        //Action
        List<Code> codes = codeRepository.findAll();
        //Verify
        Assertions.assertTrue(codes.size()>=0);
    }

    @Test
    @Order(4)
    @Rollback(value = false)
    public void updateCodeTest(){

        //Action
        Code code = codeRepository.findById("6719274f34dea1082bc0bf9e_20241023_164151").get();
        code.setCodeName("Code Update");
        Code codeUpdated =  codeRepository.save(code);

        //Verify
        Assertions.assertEquals("Code Update", codeUpdated.getCodeName());
    }

    @Test
    @Order(5)
    @Rollback(value = false)
    public void deleteCodeTest(){
        //Action
        codeRepository.deleteById("6719274f34dea1082bc0bf9e_20241023_164151");
        Optional<Code> codeOptional = codeRepository.findById("6719274f34dea1082bc0bf9e_20241023_164151");

        //Verify
        Assertions.assertTrue(codeOptional.isEmpty());
    }
}
