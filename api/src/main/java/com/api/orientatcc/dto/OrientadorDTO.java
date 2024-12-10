package com.api.orientatcc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OrientadorDTO {

    private Long id;
    private String nome;
    private String email;
    private Long vagas;
}
