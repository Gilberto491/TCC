package com.api.orientatcc.services;

import com.api.orientatcc.model.Tcc;
import com.api.orientatcc.repository.TccRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TccService {

    private final TccRepository tccRepository;

    @Autowired
    public TccService(TccRepository tccRepository) {
        this.tccRepository = tccRepository;
    }

    // CRUD TCC
    public List<Tcc> getAllTccs() {
        return tccRepository.findAll();
    }

    public Optional<Tcc> getTccById(Long id) {
        return tccRepository.findById(id);
    }

    public Tcc createTcc(Tcc tcc) {
        return tccRepository.save(tcc);
    }

    public Optional<Tcc> updateTcc(Long id, Tcc tccDetails) {
        return tccRepository.findById(id).map(tcc -> {
            tcc.setTitulo(tccDetails.getTitulo());
            tcc.setDescricao(tccDetails.getDescricao());
            tcc.setLink(tccDetails.getLink());
            tcc.setDocumentoUrl(tccDetails.getDocumentoUrl());
            return tccRepository.save(tcc);
        });
    }

    public void deleteTcc(Long id) {
        tccRepository.deleteById(id);
    }
}
