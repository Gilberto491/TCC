package com.api.orientatcc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Getter
@Setter
public class Feedback implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String comentario;

    @ManyToOne
    @JoinColumn(name = "tcc_id")
    @JsonBackReference(value = "tcc-feedback")
    private Tcc tcc; // Feedback relacionado a um TCC específico

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    @JsonBackReference(value = "aluno-feedback")
    private Aluno aluno; // Feedback dado ao aluno

    @ManyToOne
    @JoinColumn(name = "professor_id")
    @JsonBackReference(value = "professor-feedback")
    private Professor professor; // Professor que deu o feedback
}
