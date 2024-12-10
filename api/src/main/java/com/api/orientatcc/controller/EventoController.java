package com.api.orientatcc.controller;

import com.api.orientatcc.model.Evento;
import com.api.orientatcc.services.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    @Autowired
    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    // GET: Listar todos os eventos
    @GetMapping
    public List<Evento> getAllEventos() {
        return eventoService.getAllEventos();
    }

    // GET: Buscar evento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Evento> getEventoById(@PathVariable Long id) {
        Optional<Evento> evento = eventoService.getEventoById(id);
        return evento.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Criar novo evento
    @PostMapping
    public Evento createEvento(@RequestBody Evento evento) {
        return eventoService.createEvento(evento);
    }

    // PUT: Atualizar evento existente
    @PutMapping("/{id}")
    public ResponseEntity<Evento> updateEvento(@PathVariable Long id, @RequestBody Evento eventoDetails) {
        Optional<Evento> evento = eventoService.updateEvento(id, eventoDetails);
        return evento.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Deletar evento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Long id) {
        eventoService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favoritar")
    public ResponseEntity<?> favoritarEvento(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean favoritado = body.get("favoritado");
        eventoService.atualizarFavorito(id, favoritado);
        return ResponseEntity.ok().build();
    }
}
