package com.api.orientatcc.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coordenador")
public class CoordenadorController {

    @GetMapping("/info")
    public String coordenadorInfo() {
        return "Informações do Coordenador";
    }
}
