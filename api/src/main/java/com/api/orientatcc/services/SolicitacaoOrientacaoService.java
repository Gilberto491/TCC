package com.api.orientatcc.services;

import com.api.orientatcc.config.JwtTokenUtil;
import com.api.orientatcc.dto.SolicitacaoOrientacaoDTO;
import com.api.orientatcc.model.Aluno;
import com.api.orientatcc.model.Professor;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.repository.AlunoRepository;
import com.api.orientatcc.repository.ProfessorRepository;
import com.api.orientatcc.repository.SolicitacaoOrientacaoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SolicitacaoOrientacaoService {

    private final SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final AlunoService alunoService;
    private final JwtTokenUtil jwtTokenUtil;

    // CRUD Solicitação de Orientação
    public List<SolicitacaoOrientacao> getAllSolicitacoes() {
        return solicitacaoOrientacaoRepository.findAll();
    }

    public Optional<SolicitacaoOrientacao> getSolicitacaoById(Long id) {
        return solicitacaoOrientacaoRepository.findById(id);
    }

    public SolicitacaoOrientacao createSolicitacao(SolicitacaoOrientacaoDTO solicitacaoDTO, String token) {

        // Decodificar o token e pegar o userId
        String tokenSemBearer = token.substring(7); // Remove 'Bearer ' do início
        Long userId = jwtTokenUtil.getUserIdFromToken(tokenSemBearer);

        // Buscar o aluno pelo userId
        Aluno aluno = alunoService.findAlunoByUserId(userId);

        // Criar lógica para encontrar o Aluno e o Professor pelos IDs
        Professor professor = professorRepository.findById(solicitacaoDTO.getProfessorId())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        System.out.println(professor.getId());

        // Criar uma nova solicitação
        SolicitacaoOrientacao solicitacao = new SolicitacaoOrientacao();
        solicitacao.setTitulo(solicitacaoDTO.getTitulo());
        solicitacao.setDescricao(solicitacaoDTO.getDescricao());
        solicitacao.setAceita(false);
        solicitacao.setAluno(aluno);
        solicitacao.setProfessor(professor);

        return solicitacaoOrientacaoRepository.save(solicitacao);
    }

    public Optional<SolicitacaoOrientacao> updateSolicitacao(Long id, SolicitacaoOrientacao solicitacaoDetails) {
        return solicitacaoOrientacaoRepository.findById(id).map(solicitacao -> {
            solicitacao.setTitulo(solicitacaoDetails.getTitulo());
            solicitacao.setDescricao(solicitacaoDetails.getDescricao());
            solicitacao.setAceita(solicitacaoDetails.isAceita());
            return solicitacaoOrientacaoRepository.save(solicitacao);
        });
    }

    public void deleteSolicitacao(Long id) {
        solicitacaoOrientacaoRepository.deleteById(id);
    }

    public boolean aceitarSolicitacao(Long id) {
        Optional<SolicitacaoOrientacao> solicitacaoOpt = solicitacaoOrientacaoRepository.findById(id);

        if (solicitacaoOpt.isPresent()) {
            SolicitacaoOrientacao solicitacao = solicitacaoOpt.get();
            Optional<Aluno> alunoOpt = alunoRepository.findById(solicitacao.getAluno().getId());
            Optional<Professor> professorOpt = professorRepository.findById(solicitacao.getProfessor().getId());
            Aluno aluno = alunoOpt.get();
            Professor professor = professorOpt.get();
            aluno.setOrientador(professor);
            solicitacao.setAceita(true); // Atualiza o campo `aceita` para true
            solicitacaoOrientacaoRepository.save(solicitacao);
            return true;
        }
        return false;
    }
}
