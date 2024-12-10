package com.api.orientatcc.repository;

import com.api.orientatcc.model.SolicitacaoOrientacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoOrientacaoRepository extends JpaRepository<SolicitacaoOrientacao, Long> {
    Optional<SolicitacaoOrientacao> findByAlunoId(Long alunoId);
    List<SolicitacaoOrientacao> findByProfessorId(Long professorId);
}
