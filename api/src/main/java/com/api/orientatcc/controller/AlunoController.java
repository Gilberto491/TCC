package com.api.orientatcc.controller;

import com.api.orientatcc.dto.AlunoDTO;
import com.api.orientatcc.dto.request.AlunoRequestDTO;
import com.api.orientatcc.dto.response.AlunoResponseDTO;
import com.api.orientatcc.model.Aluno;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.model.Tcc;
import com.api.orientatcc.model.User;
import com.api.orientatcc.model.integracao.Integracao;
import com.api.orientatcc.repository.AlunoRepository;
import com.api.orientatcc.repository.SolicitacaoOrientacaoRepository;
import com.api.orientatcc.repository.integracao.IntegracaoRepository;
import com.api.orientatcc.services.AlunoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;
    private final AlunoRepository alunoRepository;
    private final IntegracaoRepository integracaoRepository;
    private final SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository;

    @Autowired
    public AlunoController(AlunoService alunoService, AlunoRepository alunoRepository, IntegracaoRepository integracaoRepository, SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository) {
        this.alunoService = alunoService;
        this.alunoRepository = alunoRepository;
        this.integracaoRepository = integracaoRepository;
        this.solicitacaoOrientacaoRepository = solicitacaoOrientacaoRepository;
    }

    // GET: Listar todos os alunos
    @GetMapping
    public List<AlunoResponseDTO> getAllAlunos() {
        return alunoService.getAllAlunos();
    }

    // GET: Buscar aluno por ID
    @GetMapping("/{id}")
    public ResponseEntity<Aluno> getAlunoById(@PathVariable Long id) {

        Aluno alunoId = alunoService.findAlunoByUserId(id);

        Optional<Aluno> aluno = alunoService.getAlunoById(alunoId.getId());
        System.out.println(aluno.get().getOrientador().getNome());
        return aluno.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET: Buscar aluno por ID
    @GetMapping("/tcc/{id}")
    public boolean getAlunoByIdByTCC(@PathVariable Long id) {

        Aluno alunoId = alunoService.findAlunoByUserId(id);

        //Optional<Aluno> aluno = alunoService.getAlunoById(alunoId.getId());

        boolean existe = solicitacaoOrientacaoRepository.findByAlunoId(alunoId.getId()).isPresent();
        Optional<SolicitacaoOrientacao> solicitacaoOrientacao = solicitacaoOrientacaoRepository.findByAlunoId(alunoId.getId());

        if (existe) {
            if (solicitacaoOrientacao.get().isAceita()) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    // GET: Buscar aluno
    @GetMapping("/me/{id}")
    public ResponseEntity<Aluno> getAluno(@PathVariable Long id) {
        Optional<Aluno> aluno = alunoService.getAlunoById(id);

        return aluno.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Criar novo aluno
    @PostMapping
    public ResponseEntity<?> createAluno(@RequestBody Aluno aluno) {

        String matricula = aluno.getMatricula();

        Optional<Integracao> integracaoOptional = integracaoRepository.findByIdentificador(Long.valueOf(matricula));
        if (integracaoOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Matrícula não encontrada no sistema.");
        }

        boolean alunoExistente = alunoRepository.existsByMatricula(matricula);
        if (alunoExistente) {
            return ResponseEntity.badRequest().body("Aluno com esta matrícula já está cadastrado no sistema.");
        }

        Integracao integracao = integracaoOptional.get();

        // 3. Criar o novo aluno com base nos dados da integração
        Aluno alunoSave = new Aluno();
        alunoSave.setMatricula(matricula); // Matricula = identificador
        alunoSave.setNome(aluno.getNome()); // Nome vem do frontend
        User user = new User();
        user.setUsername(integracao.getUsername());
        user.setPassword(integracao.getPassword());
        alunoSave.setUser(user);
        alunoRepository.save(alunoSave);

        return ResponseEntity.ok().body(alunoSave);
    }

    // PUT: Atualizar aluno existente
    @PutMapping("/{id}")
    public ResponseEntity<AlunoDTO> updateAluno(@PathVariable Long id, @RequestBody AlunoRequestDTO alunoDetails) {

        Aluno alunoId = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));


        alunoId.setNome(alunoDetails.getNome());
        alunoId.setMatricula(alunoDetails.getMatricula());
        Optional<Aluno> aluno = alunoService.updateAluno(alunoId.getId(), alunoId);

        AlunoDTO alunoDTO = toAlunoDTO(aluno);

        return ResponseEntity.ok().body(alunoDTO);
    }

    // DELETE: Deletar aluno
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAluno(@PathVariable Long id) {
        alunoService.deleteAluno(id);
        return ResponseEntity.noContent().build();
    }

    // POST: Submeter TCC
    @PostMapping("/{alunoId}/tcc")
    public Tcc submitTcc(@PathVariable Long alunoId, @RequestBody Tcc tcc) {
        return alunoService.submitTcc(alunoId, tcc);
    }

    private AlunoDTO toAlunoDTO(Optional<Aluno> alunoOptional) {
        if (alunoOptional.isPresent()) {
            Aluno aluno = alunoOptional.get();
            AlunoDTO dto = new AlunoDTO();
            dto.setId(aluno.getId());
            dto.setMatricula(aluno.getMatricula());
            dto.setNome(aluno.getNome());

            return dto;
        }
        return null;
    }
}
