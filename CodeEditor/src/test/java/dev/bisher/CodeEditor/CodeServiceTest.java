package dev.bisher.CodeEditor;

import dev.bisher.CodeEditor.repository.CodeRepository;
import dev.bisher.CodeEditor.model.code.Code;
import dev.bisher.CodeEditor.service.code.CodeService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;


@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest
class CodeServiceTest {

    @Mock
    private CodeRepository codeRepository;

    @InjectMocks
    private CodeService codeService;

    private Code code;

    @BeforeEach
    public void setup() {
        code = new Code();
        code.setCodeName("Test Code");
    }

    @Test
    @Order(1)
    public void saveEmployeeTest(){
        // precondition
        given(codeRepository.save(code)).willReturn(code);

        //action
        Code savedCode = codeService.updateCode(code);

        // verify the output
        assertThat(savedCode).isNotNull();
    }


}
