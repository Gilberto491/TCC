package com.api.orientatcc.services;

import com.api.orientatcc.dto.response.AlunoResponseDTO;
import com.api.orientatcc.model.Aluno;
import com.api.orientatcc.model.Tcc;
import com.api.orientatcc.model.User;
import com.api.orientatcc.model.enumerations.Role;
import com.api.orientatcc.repository.AlunoRepository;
import com.api.orientatcc.repository.TccRepository;
import com.api.orientatcc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final TccRepository tccRepository;
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public AlunoService(AlunoRepository alunoRepository, TccRepository tccRepository, UserRepository userRepository) {
        this.alunoRepository = alunoRepository;
        this.tccRepository = tccRepository;
        this.userRepository = userRepository;
    }

    // CRUD Aluno
    public List<AlunoResponseDTO> getAllAlunos() {

        List<Aluno> alunos = alunoRepository.findAll(); // Busca todos os alunos

        return alunos.stream()
                .map(this::convertToAlunoResponseDTO) // Método para conversão
                .collect(Collectors.toList());
    }

    // Método para conversão de Aluno para AlunoResponseDTO
    private AlunoResponseDTO convertToAlunoResponseDTO(Aluno aluno) {
        AlunoResponseDTO dto = new AlunoResponseDTO();
        dto.setId(aluno.getId());
        dto.setNome(aluno.getNome());
        dto.setMatricula(aluno.getMatricula());
        dto.setUser(aluno.getUser());
        // Adicione mais campos conforme necessário
        return dto;
    }

    public Optional<Aluno> getAlunoById(Long id) {
        return alunoRepository.findById(id);
    }

    public AlunoResponseDTO createAluno(Aluno aluno) {
        User user = new User();
        if (aluno.getUser() != null && aluno.getUser().getId() == null) {
            user.setUsername(aluno.getUser().getUsername());
            user.setPassword(passwordEncoder.encode(aluno.getUser().getPassword()));
            user.getRoles().add(Role.ALUNO);
            aluno.setUser(user);
            // Se o ID do User é null, o usuário ainda não foi salvo, então salve-o primeiro
            userRepository.save(aluno.getUser());
        }

        alunoRepository.save(aluno);
        return convertToAlunoResponseDTO(aluno);

    }

    public Optional<Aluno> updateAluno(Long id, Aluno alunoDetails) {
        return alunoRepository.findById(id).map(aluno -> {
            aluno.setNome(alunoDetails.getNome());
            aluno.setMatricula(alunoDetails.getMatricula());
            return alunoRepository.save(aluno);
        });
    }

    public void deleteAluno(Long id) {
        alunoRepository.deleteById(id);
    }

    // Submissão de TCC
    public Tcc submitTcc(Long alunoId, Tcc tcc) {
        Aluno aluno = alunoRepository.findById(alunoId).orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        tcc.setAluno(aluno);
        return tccRepository.save(tcc);
    }

    public Aluno findAlunoByUserId(Long userId) {
        return alunoRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado para o userId: " + userId));
    }
}