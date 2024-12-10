package com.api.orientatcc.controller;

import com.api.orientatcc.model.Tcc;
import com.api.orientatcc.services.TccService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tccs")
public class TccController {

    private final TccService tccService;

    @Autowired
    public TccController(TccService tccService) {
        this.tccService = tccService;
    }

    // GET: Listar todos os TCCs
    @GetMapping
    public List<Tcc> getAllTccs() {
        return tccService.getAllTccs();
    }

    // GET: Buscar TCC por ID
    @GetMapping("/{id}")
    public ResponseEntity<Tcc> getTccById(@PathVariable Long id) {
        //pegar o id do aluno
        Optional<Tcc> tcc = tccService.getTccById(id);
        return tcc.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Criar novo TCC
    @PostMapping
    public Tcc createTcc(@RequestBody Tcc tcc) {
        return tccService.createTcc(tcc);
    }

    // PUT: Atualizar TCC existente
    @PutMapping("/{id}")
    public ResponseEntity<Tcc> updateTcc(@PathVariable Long id, @RequestBody Tcc tccDetails) {
        Optional<Tcc> tcc = tccService.updateTcc(id, tccDetails);
        return tcc.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Deletar TCC
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTcc(@PathVariable Long id) {
        tccService.deleteTcc(id);
        return ResponseEntity.noContent().build();
    }
}
