package dev.bisher.CodeEditor;

import dev.bisher.CodeEditor.repository.CodeRepository;
import dev.bisher.CodeEditor.model.code.Code;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
class CodeRepositoryMongoTest {

    @Autowired
    private CodeRepository codeRepository;

    @Test
    void testSaveAndRetrieveCode() {
        Code code = new Code();
        String codeId = code.getId();
        code.setCodeName("MongoDB test code");
        codeRepository.save(code);

        Code retrievedCode = codeRepository.findById(codeId).orElse(null);
        assertNotNull(retrievedCode);
        assertEquals("MongoDB test code", retrievedCode.getCodeName());
    }
}

