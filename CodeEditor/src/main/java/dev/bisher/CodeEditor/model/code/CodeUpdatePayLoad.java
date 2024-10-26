package dev.bisher.CodeEditor.model.code;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodeUpdatePayLoad {
    String codeBody;
    String codeName;

    public String getCodeBody() {
        return codeBody;
    }

    public void setCodeBody(String codeBody) {
        this.codeBody = codeBody;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
    }
}
