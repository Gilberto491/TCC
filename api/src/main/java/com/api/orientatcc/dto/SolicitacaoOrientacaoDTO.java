package com.api.orientatcc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SolicitacaoOrientacaoDTO {
    private String titulo;
    private String descricao;
    private Long alunoId;  // Apenas o ID do aluno
    private Long professorId;  // Apenas o ID do professor
}
