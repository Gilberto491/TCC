package com.api.orientatcc.repository.integracao;

import com.api.orientatcc.model.integracao.Integracao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IntegracaoRepository extends JpaRepository<Integracao, Long> {
    Optional<Integracao> findByIdentificador(Long identificador);
}
