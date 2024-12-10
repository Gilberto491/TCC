package com.api.orientatcc.dto.request;

import com.api.orientatcc.dto.SolicitacaoOrientacaoDTO;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AlunoRequestDTO {

    private String nome;
    private String matricula;
    private User user;
    private List<SolicitacaoOrientacaoDTO> solicitacaoOrientacaoDTOs;

}
