package com.api.orientatcc.services;

import com.api.orientatcc.model.Aluno;
import com.api.orientatcc.model.Professor;
import com.api.orientatcc.model.SolicitacaoOrientacao;
import com.api.orientatcc.model.User;
import com.api.orientatcc.model.enumerations.Role;
import com.api.orientatcc.repository.ProfessorRepository;
import com.api.orientatcc.repository.SolicitacaoOrientacaoRepository;
import com.api.orientatcc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository;
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public ProfessorService(ProfessorRepository professorRepository, SolicitacaoOrientacaoRepository solicitacaoOrientacaoRepository, UserRepository userRepository) {
        this.professorRepository = professorRepository;
        this.solicitacaoOrientacaoRepository = solicitacaoOrientacaoRepository;
        this.userRepository = userRepository;
    }

    // CRUD Professor
    public List<Professor> getAllProfessores() {
        return professorRepository.findAll();
    }

    public Optional<Professor> getProfessorById(Long id) {
        return professorRepository.findById(id);
    }

    public Professor createProfessor(Professor professor) {

        User user = new User();
        if (professor.getUser() != null && professor.getUser().getId() == null) {
            user.setUsername(professor.getUser().getUsername());
            user.setPassword(passwordEncoder.encode(professor.getUser().getPassword()));
            if (professor.isCoordenador()) {
                user.getRoles().add(Role.COORDENADOR);
            } else {
                user.getRoles().add(Role.PROFESSOR);
            }
            professor.setUser(user);
            // Se o ID do User é null, o usuário ainda não foi salvo, então salve-o primeiro
            userRepository.save(professor.getUser());
        }
        return professorRepository.save(professor);
    }

    public Optional<Professor> updateProfessor(Long id, Professor professorDetails) {
        return professorRepository.findById(id).map(professor -> {
            professor.setNome(professorDetails.getNome());
            professor.setVagas(professorDetails.getVagas());
            professor.setCoordenador(professorDetails.isCoordenador());
            return professorRepository.save(professor);
        });
    }

    public void deleteProfessor(Long id) {
        professorRepository.deleteById(id);
    }

    public Professor findProfessorByUserId(Long userId) {
        return professorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Professor não encontrado para o userId: " + userId));
    }

    // Aceitar solicitação de orientação
    public Optional<SolicitacaoOrientacao> aceitarSolicitacao(Long solicitacaoId) {
        return solicitacaoOrientacaoRepository.findById(solicitacaoId).map(solicitacao -> {
            solicitacao.setAceita(true);
            return solicitacaoOrientacaoRepository.save(solicitacao);
        });
    }

    public Professor findById(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor não encontrado para o id " + id));
    }
}