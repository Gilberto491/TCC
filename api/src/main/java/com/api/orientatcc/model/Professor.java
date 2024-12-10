package com.api.orientatcc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Entity
@Getter
@Setter
public class Professor implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private int vagas; // Limite de vagas de orientandos
    private String siape;

    @OneToMany(mappedBy = "orientador", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
   // @JsonManagedReference(value = "professor-aluno")
    private List<Aluno> orientandos; // Lista de alunos orientados por este professor

    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "professor-solicitacao")
    private List<SolicitacaoOrientacao> solicitacoes; // Lista de solicitações que o professor pode aceitar/rejeitar

    // Relacionamento com User
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-professor")
    private User user; // Cada professor tem um usuário

    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "professor-feedback")
    private List<Feedback> feedbacks; // Feedbacks dados aos alunos

    private boolean isCoordenador; // Define se o professor também é coordenador
}
