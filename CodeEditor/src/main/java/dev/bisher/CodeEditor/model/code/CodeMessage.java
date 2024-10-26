package dev.bisher.CodeEditor.model.code;

public class CodeMessage {

    private String codeBody;

    public CodeMessage() {
    }

    public CodeMessage(String codeBody) {
        this.codeBody = codeBody;
    }

    public String getCodeBody() {
        return codeBody;
    }

    public void setCodeBody(String codeBody) {
        this.codeBody = codeBody;
    }
}
