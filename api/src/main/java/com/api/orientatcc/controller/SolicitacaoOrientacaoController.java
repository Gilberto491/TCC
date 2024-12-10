package com.api.orientatcc.controller;

import com.api.orientatcc.dto.AlunoDTO;
import com.api.orientatcc.dto.ProfessorDTO;
import com.api.orientatcc.dto.SolicitacaoOrientacaoDTO;
import com.api.orientatcc.dto.response.SolicitacaoOrientacaoResponseDTO;
import com.api.orientatcc.model.Aluno;
import com.api.orientatcc.model.Professor;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.repository.SolicitacaoOrientacaoRepository;
import com.api.orientatcc.services.AlunoService;
import com.api.orientatcc.services.ProfessorService;
import com.api.orientatcc.services.SolicitacaoOrientacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoOrientacaoController {

    private final SolicitacaoOrientacaoService solicitacaoOrientacaoService;
    private final SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository;
    private final AlunoService alunoService;
    private final ProfessorService professorService;

    @Autowired
    public SolicitacaoOrientacaoController(SolicitacaoOrientacaoService solicitacaoOrientacaoService,
                                           SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository,
                                           AlunoService alunoService,
                                           ProfessorService professorService) {
        this.solicitacaoOrientacaoService = solicitacaoOrientacaoService;
        this.solicitacaoOrientacaoRepository = solicitacaoOrientacaoRepository;
        this.alunoService = alunoService;
        this.professorService = professorService;
    }

    @GetMapping("/professor/{userId}")
    public ResponseEntity<List<SolicitacaoOrientacaoResponseDTO>> getAllSolicitacoes(@PathVariable Long userId) {
        // Encontrar o professor pelo userId
        Professor professor = professorService.findProfessorByUserId(userId);

        // Buscar as solicitações feitas para esse professor
        List<SolicitacaoOrientacao> solicitacoes = solicitacaoOrientacaoRepository.findByProfessorId(professor.getId());

        // Verificar se a lista de solicitações está vazia
        if (solicitacoes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // Criar uma lista para armazenar os DTOs
        List<SolicitacaoOrientacaoResponseDTO> dtoList = new ArrayList<>();

        // Converter cada entidade SolicitacaoOrientacao em um DTO
        for (SolicitacaoOrientacao solicitacao : solicitacoes) {
            if(!solicitacao.isAceita()) {
                SolicitacaoOrientacaoResponseDTO dto = convertToDTO(solicitacao);
                dtoList.add(dto);
            }
        }
        // Retornar a lista de DTOs
        return ResponseEntity.ok(dtoList);
    }


    // GET: Buscar solicitação por ID
    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoOrientacao> getSolicitacaoById(@PathVariable Long id) {
        Optional<SolicitacaoOrientacao> solicitacao = solicitacaoOrientacaoService.getSolicitacaoById(id);
        return solicitacao.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Criar nova solicitação
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createSolicitacao(@RequestBody SolicitacaoOrientacaoDTO solicitacao, @RequestHeader("Authorization") String token) {
        solicitacaoOrientacaoService.createSolicitacao(solicitacao, token);
        return ResponseEntity.ok().build();
    }

    // PUT: Atualizar solicitação existente
    @PutMapping("/{id}")
    public ResponseEntity<SolicitacaoOrientacao> updateSolicitacao(@PathVariable Long id, @RequestBody SolicitacaoOrientacao solicitacaoDetails) {
        Optional<SolicitacaoOrientacao> solicitacao = solicitacaoOrientacaoService.updateSolicitacao(id, solicitacaoDetails);
        return solicitacao.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Deletar solicitação
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSolicitacao(@PathVariable Long id) {
        solicitacaoOrientacaoService.deleteSolicitacao(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/aluno/{userId}")
    public ResponseEntity<SolicitacaoOrientacaoResponseDTO> getSolicitacaoByAlunoId(@PathVariable Long userId) {
        Aluno aluno = alunoService.findAlunoByUserId(userId);
        Optional<SolicitacaoOrientacao> solicitacao = solicitacaoOrientacaoRepository.findByAlunoId(aluno.getId());
        if (solicitacao.isPresent()) {
            SolicitacaoOrientacaoResponseDTO dto = convertToDTO(solicitacao.get());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/{id}/aceitar")
    public ResponseEntity<Void> aceitarSolicitacao(@PathVariable Long id) {
        boolean updated = solicitacaoOrientacaoService.aceitarSolicitacao(id);
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Conversão de SolicitacaoOrientacao para DTO
    private SolicitacaoOrientacaoResponseDTO convertToDTO(SolicitacaoOrientacao solicitacao) {
        SolicitacaoOrientacaoResponseDTO dto = new SolicitacaoOrientacaoResponseDTO();
        dto.setId(solicitacao.getId());
        dto.setDataCriacao(solicitacao.getDataCriacao());
        dto.setTitulo(solicitacao.getTitulo());
        dto.setDescricao(solicitacao.getDescricao());
        dto.setAceita(solicitacao.isAceita());

        // Converte Aluno para AlunoDTO
        AlunoDTO alunoDTO = new AlunoDTO();
        alunoDTO.setId(solicitacao.getAluno().getId());
        alunoDTO.setNome(solicitacao.getAluno().getNome());
        alunoDTO.setMatricula(solicitacao.getAluno().getMatricula());
        dto.setAluno(alunoDTO);

        // Converte Professor para ProfessorDTO
        ProfessorDTO professorDTO = new ProfessorDTO();
        professorDTO.setId(solicitacao.getProfessor().getId());
        professorDTO.setNome(solicitacao.getProfessor().getNome());
        professorDTO.setEmail(solicitacao.getProfessor().getEmail());
        dto.setProfessor(professorDTO);

        return dto;
    }

}
