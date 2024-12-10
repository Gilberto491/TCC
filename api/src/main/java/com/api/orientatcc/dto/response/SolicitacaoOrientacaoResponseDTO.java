package com.api.orientatcc.dto.response;

import com.api.orientatcc.dto.AlunoDTO;
import com.api.orientatcc.dto.ProfessorDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SolicitacaoOrientacaoResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private boolean aceita;
    private LocalDateTime dataCriacao;
    private AlunoDTO aluno;
    private ProfessorDTO professor;
}
