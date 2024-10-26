package dev.bisher.CodeEditor;


import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bisher.CodeEditor.controller.code.CodeController;
import dev.bisher.CodeEditor.model.code.Code;
import dev.bisher.CodeEditor.service.code.CodeService;
import dev.bisher.CodeEditor.service.file.FileSystemService;
import dev.bisher.CodeEditor.service.user.UserService;
import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.BDDMockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CodeController.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CodeService codeService;

    @MockBean
    private FileSystemService fileSystemService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    Code code;

    @BeforeEach
    public void setup(){

        code = new Code();
        code.setCodeName("Test Code");

    }

    //Post Controller
    @Test
    @Order(1)
    public void saveCodeTest() throws Exception{
        // precondition
        given(codeService.updateCode(any(Code.class))).willReturn(code);

        // action
        ResultActions response = mockMvc.perform(post("/api/v1/codes/add-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(code)));

        // verify
        response.andDo(print()).
                andExpect(status().isForbidden());

    }

    //Get Controller
    @Test
    @Order(2)
    public void getCodeTest() throws Exception{
        // precondition
        List<Code> codeList = new ArrayList<>();
        codeList.add(code);
        Code code2 = new Code();
        code.setCodeName("code2");
        codeList.add(code2);
        given(codeService.allCodes()).willReturn(codeList);

        // action
        ResultActions response = mockMvc.perform(get("/api/codes"));

        // verify the output
        response.andExpect(status().isOk());

    }

    //get by Id controller
    @Test
    @Order(3)
    public void getByIdCodeTest() throws Exception{
        // precondition
        given(codeService.findCodeById(code.getId())).willReturn(Optional.of(code));

        // action
        ResultActions response = mockMvc.perform(get("/api/codes/{id}", code.getId()));

        // verify
        response.andExpect(status().isOk());

    }


    //Update Code
    @Test
    @Order(4)
    public void updateEmployeeTest() throws Exception{
        // precondition
        given(codeService.findCodeById(code.getId())).willReturn(Optional.of(code));
        code.setCodeName("Max");
        given(codeService.updateCode(code)).willReturn(code);

        // action
        ResultActions response = mockMvc.perform(put("/api/codes/{id}", code.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(code)));

        // verify
        response.andExpect(status().isOk());

    }


    // delete employee
    @Test
    @Order(2)
    public void deleteCodeTest() throws Exception{
        // precondition
        willDoNothing().given(codeService).deleteCode(code.getId());

        // action
        ResultActions response = mockMvc.perform(delete("/api/v1/codes/delete-code/{id}", code.getId()));

        // then - verify the output
        response.andExpect(status().isForbidden())
                .andDo(print());
    }
}