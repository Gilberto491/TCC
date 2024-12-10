package com.api.orientatcc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;


@Getter
@Setter
@Entity
public class SolicitacaoOrientacao implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;
    private boolean aceita; // Se a solicitação foi aceita ou não

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    @JsonBackReference(value = "aluno-solicitacao")
    private Aluno aluno; // Solicitação feita por um aluno

    @ManyToOne
    @JoinColumn(name = "professor_id")
    @JsonBackReference(value = "professor-solicitacao")
    private Professor professor; // Professor que receberá a solicitação

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }
}