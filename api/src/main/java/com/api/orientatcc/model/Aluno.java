package com.api.orientatcc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String matricula;

    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "aluno-tcc")
    private List<Tcc> tccs; // Um aluno pode ter vários TCCs

    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "aluno-solicitacao")
    private List<SolicitacaoOrientacao> solicitacoes; // Um aluno pode ter várias solicitações de orientação

    @ManyToOne
    @JoinColumn(name = "orientador_id")
    //@JsonIgnoreProperties({"orientandos"})
    private Professor orientador; // Um aluno tem um orientador (caso aceito)

    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "aluno-feedback")
    private List<Feedback> feedbacks; // Feedbacks recebidos após a submissão do TCC

    // Relacionamento com User
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-aluno")
    private User user; // Cada aluno tem um usuário
}
