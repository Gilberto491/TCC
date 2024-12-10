package com.api.orientatcc.services;

import com.api.orientatcc.model.Evento;
import com.api.orientatcc.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

    @Autowired
    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    // CRUD Evento
    public List<Evento> getAllEventos() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> getEventoById(Long id) {
        return eventoRepository.findById(id);
    }

    public Evento createEvento(Evento evento) {
        return eventoRepository.save(evento);
    }

    public Optional<Evento> updateEvento(Long id, Evento eventoDetails) {
        return eventoRepository.findById(id).map(evento -> {
            evento.setTitulo(eventoDetails.getTitulo());
            evento.setData(eventoDetails.getData());
            return eventoRepository.save(evento);
        });
    }

    public void deleteEvento(Long id) {
        eventoRepository.deleteById(id);
    }

    public void atualizarFavorito(Long id, boolean favoritado) {
        Evento evento = eventoRepository.findById(id).orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        evento.setFavoritado(favoritado);
        eventoRepository.save(evento);
    }
}