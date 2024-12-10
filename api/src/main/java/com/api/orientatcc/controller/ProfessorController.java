package com.api.orientatcc.controller;

import com.api.orientatcc.model.Professor;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.model.User;
import com.api.orientatcc.model.integracao.Integracao;
import com.api.orientatcc.repository.ProfessorRepository;
import com.api.orientatcc.repository.integracao.IntegracaoRepository;
import com.api.orientatcc.services.ProfessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/professores")
public class ProfessorController {

    private final ProfessorService professorService;
    private final ProfessorRepository professorRepository;
    private final IntegracaoRepository integracaoRepository;

    @Autowired
    public ProfessorController(ProfessorService professorService, ProfessorRepository professorRepository, IntegracaoRepository integracaoRepository) {
        this.professorService = professorService;
        this.professorRepository = professorRepository;
        this.integracaoRepository = integracaoRepository;
    }

    // GET: Listar todos os professores
    @GetMapping
    public List<Professor> getAllProfessores() {
        return professorService.getAllProfessores();
    }

    // GET: Buscar professor por ID
    @GetMapping("/{id}")
    public ResponseEntity<Professor> getProfessorById(@PathVariable Long id) {
        Optional<Professor> professor = professorService.getProfessorById(id);
        return professor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Criar novo professor
    @PostMapping
    public ResponseEntity<?> createProfessor(@RequestBody Professor professor) {

        String siape = professor.getSiape();
        Optional<Integracao> integracaoOptional = integracaoRepository.findByIdentificador(Long.valueOf(siape));

        if (integracaoOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Siape não encontrada no sistema.");
        }

        boolean professorExistente = professorRepository.existsBySiape(siape);

        if (professorExistente) {
            return ResponseEntity.badRequest().body("Professor com este siape já está cadastrado no sistema.");
        }

        Integracao integracao = integracaoOptional.get();

        // 3. Criar o novo professor com base nos dados da integração
        Professor professorSave = new Professor();
        professorSave.setSiape(siape);
        professorSave.setNome(professor.getNome());
        professorSave.setCoordenador(professorSave.isCoordenador());
        professorSave.setEmail(integracao.getEmail());
        professorSave.setVagas(integracao.getVagas());

        User user = new User();
        user.setUsername(integracao.getUsername());
        user.setPassword(integracao.getPassword());
        professorSave.setUser(user);
        professorRepository.save(professorSave);

        return ResponseEntity.ok().body(professorSave);
    }

    // PUT: Atualizar professor existente
    @PutMapping("/{id}")
    public ResponseEntity<Professor> updateProfessor(@PathVariable Long id, @RequestBody Professor professorDetails) {
        System.out.println("chegou aqqqqqqqq");
        Optional<Professor> professor = professorService.updateProfessor(id, professorDetails);
        return professor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Deletar professor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessor(@PathVariable Long id) {
        professorService.deleteProfessor(id);
        return ResponseEntity.noContent().build();
    }

    // PUT: Aceitar solicitação de orientação
    @PutMapping("/solicitacoes/{solicitacaoId}/aceitar")
    public ResponseEntity<SolicitacaoOrientacao> aceitarSolicitacao(@PathVariable Long solicitacaoId) {
        Optional<SolicitacaoOrientacao> solicitacao = professorService.aceitarSolicitacao(solicitacaoId);
        return solicitacao.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para obter o número de vagas do professor
    @GetMapping("/{id}/vagas")
    public ResponseEntity<Integer> getVagas(@PathVariable Long id) {
        Professor idProfessor = professorService.findProfessorByUserId(id);
        Professor professor = professorService.findById(idProfessor.getId());
        if (professor != null) {
            return ResponseEntity.ok(professor.getVagas()); // Supondo que o campo de vagas seja 'vagas'
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint para atualizar o número de vagas do professor
    @PutMapping("/{id}/vagas")
    public ResponseEntity<Void> updateVagas(@PathVariable Long id, @RequestBody Map<String, Integer> vagasMap) {
        Professor idProfessor = professorService.findProfessorByUserId(id);
        System.out.println(id);
        System.out.println(idProfessor.getId());
        Professor professor = professorService.findById(idProfessor.getId());
        if (professor != null) {
            Integer novasVagas = vagasMap.get("vagas");
            professor.setVagas(novasVagas); // Atualiza o número de vagas
            professorRepository.save(professor); // Salva a atualização
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}