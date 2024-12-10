package com.api.orientatcc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Getter
@Setter
public class Tcc implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;
    private String link; // Link para o TCC (pode ser Google Drive ou similar)
    private String documentoUrl; // URL do PDF ou outro formato do documento enviado

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    @JsonBackReference(value = "aluno-tcc")
    private Aluno aluno; // TCC submetido por um aluno
}
