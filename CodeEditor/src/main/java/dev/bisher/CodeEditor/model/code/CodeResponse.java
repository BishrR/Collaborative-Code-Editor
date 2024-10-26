package dev.bisher.CodeEditor.model.code;

public class CodeResponse {

    private String id;
    private String codeName;


    public CodeResponse(Code code) {
        this.id = code.getId();
        this.codeName = code.getCodeName();
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
    }
}

