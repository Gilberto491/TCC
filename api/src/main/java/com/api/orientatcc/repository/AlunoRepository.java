package com.api.orientatcc.repository;

import com.api.orientatcc.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    Optional<Aluno> findByUserId(Long userId);
    boolean existsByMatricula(String matricula);
}
