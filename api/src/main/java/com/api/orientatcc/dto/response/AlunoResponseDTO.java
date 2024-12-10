package com.api.orientatcc.dto.response;

import com.api.orientatcc.dto.OrientadorDTO;
import com.api.orientatcc.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlunoResponseDTO {

    private Long id;
    private String nome;
    private String matricula;
    private User user;
    private OrientadorDTO orientadorDTO;
}
