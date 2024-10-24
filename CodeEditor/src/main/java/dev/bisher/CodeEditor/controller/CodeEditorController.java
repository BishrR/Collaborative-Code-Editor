package dev.bisher.CodeEditor.controller;

import dev.bisher.CodeEditor.model.CodeMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

//@CrossOrigin(origins = "*")
@Controller
public class CodeEditorController {

    @MessageMapping("/edit-code")
    @SendTo("/topic/code")
    public CodeMessage updateCode(CodeMessage message) throws Exception {
//        Thread.sleep(1000);
        return new CodeMessage(HtmlUtils.htmlEscape(message.getCodeBody()));
    }
}
