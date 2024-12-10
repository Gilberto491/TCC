package com.api.orientatcc.model.enumerations;

public enum Role {
    ALUNO("ROLE_ALUNO"),
    PROFESSOR("ROLE_PROFESSOR"),
    COORDENADOR("ROLE_COORDENADOR");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}
