package com.api.orientatcc.controller.integracao;

import com.api.orientatcc.model.integracao.Integracao;
import com.api.orientatcc.repository.integracao.IntegracaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/integracao")
public class IntegracaoController {

    private final IntegracaoRepository integracaoRepository;

    @Autowired
    public IntegracaoController(IntegracaoRepository integracaoRepository) {
        this.integracaoRepository = integracaoRepository;
    }

    // Endpoint para buscar dados pelo identificador
    @GetMapping("/{identificador}")
    public ResponseEntity<Integracao> getIntegracaoByIdentificador(@PathVariable Long identificador) {
        Optional<Integracao> integracao = integracaoRepository.findByIdentificador(identificador);
        return ResponseEntity.ok(integracao.orElseThrow(() -> new RuntimeException("Identificador não encontrado")));
    }
}
