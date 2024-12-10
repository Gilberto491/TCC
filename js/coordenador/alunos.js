$(document).ready(function () {
    

    // Chamar a função para carregar os alunos ao carregar a página
    carregarAlunos();
});

// Função para carregar os alunos via AJAX
function carregarAlunos() {
    var token = localStorage.getItem('token'); // Obter o token do localStorage

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8081/api/alunos', // Endpoint para obter os alunos
        headers: {
            'Authorization': 'Bearer ' + token, // Inclui o token no cabeçalho, se necessário
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        success: function (data) {

            if ($.fn.DataTable.isDataTable('#alunosTable')) {
                $('#alunosTable').DataTable().clear().destroy(); // Destroi o DataTable existente
            }

            // Limpar a tabela antes de preencher
            var tabela = $('#alunosTable tbody');
            tabela.empty();

            // Itera sobre os alunos e adiciona-os à tabela
            data.forEach(function (aluno) {
                var orientador = aluno.orientador ? aluno.orientador.nome : '<span class="no-orientador">-</span>';
                var row = `
                    <tr>
                        <td>${aluno.nome}</td>
                        <td>${orientador}</td>
                        <td>
                            <button class="btn-action btn-edit" onclick="openAddAlunoModal(${aluno.id})">Editar</button>
                            <button class="btn-action btn-delete" onclick="openDeleteModal(${aluno.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                tabela.append(row);
            });

            // Reinicia o DataTable para funcionar com os novos dados
            $('#alunosTable').DataTable({
                "autoWidth": false,
                
                "language": {
                    "search": "Pesquisar:",
                    "lengthMenu": "Mostrar _MENU_ registros por página",
                    "info": "Mostrando página _PAGE_ de _PAGES_",
                    "infoEmpty": "Nenhum registro disponível",
                    "zeroRecords": "Nenhum registro encontrado",
                    "paginate": {
                        "previous": "Anterior",
                        "next": "Próximo"
                    }
                }
            });
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar os alunos:', error);
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function openAddAlunoModal(alunoId) {
    var token = localStorage.getItem('token'); // Obter o token de autenticação

    document.getElementById('addAlunoModal').style.display = 'flex';

    if (alunoId) {
        // Fazer a requisição para buscar os dados do aluno pelo ID
    $.ajax({
        type: 'GET',
        url: `http://localhost:8081/api/alunos/me/${alunoId}`, // Endpoint para buscar aluno pelo ID
        headers: {
            'Authorization': 'Bearer ' + token, // Token de autenticação
            'Content-Type': 'application/json'
        },
        success: function (aluno) {

           // Preenche os campos do formulário com os dados do aluno
           $('#aluno-nome').val(aluno.nome);
           $('#aluno-matricula').val(aluno.matricula).prop('readonly', true); // Torna a matrícula somente leitura

            // Atualiza o título da modal para "Editar Aluno"
            $('.modal-aluno-content h3').text('Editar Aluno');

            // Atualiza o botão para indicar que estamos editando o aluno
            $('.save-aluno-button').text('Salvar Alterações');
            
             // Atualiza o form para a edição do aluno
             $('#addAlunoForm').off('submit').on('submit', function (e) {
                e.preventDefault(); // Previne o comportamento padrão do form
                editarAluno(alunoId); // Chama a função de edição
            });

            // Exibe o modal após preencher os dados
            $('#addAlunoModal').show();
        },
        error: function (xhr, status, error) {
        },
       
    });
    } else {
        // Modo de adição de novo aluno
        $('#aluno-nome').val('');
        $('#aluno-matricula').val('').prop('readonly', false); // Campo de matrícula pode ser editado no modo de adição
        
        // Atualiza o título da modal para "Cadastrar Novo Aluno"
        $('.modal-aluno-content h3').text('Cadastrar Novo Aluno');

        // Atualiza o botão para indicar que estamos adicionando um novo aluno
        $('.save-aluno-button').text('Cadastrar Aluno');

        // Atualiza o form para a criação de um novo aluno
        $('#addAlunoForm').off('submit').on('submit', function (e) {
            e.preventDefault(); // Previne o comportamento padrão do form
            adicionarAluno(); // Chama a função para adicionar novo aluno
        });

        // Exibe o modal
        $('#addAlunoModal').show();
    }
    
}

function adicionarAluno() {
    var token = localStorage.getItem('token');
    
    // Capturar os dados do formulário
    var nome = $('#aluno-nome').val();
    var matricula = $('#aluno-matricula').val();

    // Fazer a requisição para adicionar um novo aluno
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8081/api/alunos', // Endpoint para criar um novo aluno
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        data: JSON.stringify({
            nome: nome,
            matricula: matricula
        }),
        success: function () {
            // Fecha o modal e recarrega a tabela
            $('#addAlunoModal').hide();
            carregarAlunos(); // Atualiza a tabela após a adição
            showSuccessToast("Aluno inserido com sucesso");
        },
        error: function (xhr, status, error) {
            console.error('Erro ao adicionar aluno:', error);
            const errorMessage = xhr.responseText || 'Erro ao cadastrar o aluno.';
            closeAddAlunoModal();
            showErrorToast(errorMessage); // Exibe o toast de erro
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function deleteAluno(alunoId) {
    var token = localStorage.getItem('token'); // Obter o token de autenticação

    // Fazer a requisição DELETE para remover o aluno
    $.ajax({
        type: 'DELETE', // Método HTTP para deletar o recurso
        url: `http://localhost:8081/api/alunos/${alunoId}`, // Endpoint para deletar o aluno
        headers: {
            'Authorization': 'Bearer ' + token, // Token de autenticação
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        success: function () {
            closeDeleteModal(); // Fecha a modal de confirmação
            carregarAlunos(); // Recarrega a tabela de alunos após a exclusão
            showSuccessToast('Aluno removido com sucesso!'); // Exibe o toast de sucesso
        },
        error: function (xhr, status, error) {
            console.error('Erro ao deletar aluno:', error);
            showErrorToast('Erro ao remover o aluno. Tente novamente!'); // Exibe o toast de erro
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function editarAluno(alunoId) {
    var token = localStorage.getItem('token'); // Obter o token de autenticação

    // Capturar os dados do formulário
    var nome = $('#aluno-nome').val();
    var matricula = $('#aluno-matricula').val();

    // Fazer a requisição para atualizar os dados do aluno
    $.ajax({
        type: 'PUT', // Método HTTP para atualizar o recurso
        url: `http://localhost:8081/api/alunos/${alunoId}`, // Endpoint para editar o aluno
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        data: JSON.stringify({
            nome: nome,
            matricula: matricula
        }),
        success: function () {
            // Fecha o modal e recarrega a tabela
            $('#addAlunoModal').hide();
            carregarAlunos(); // Atualiza a tabela após a edição
            showSuccessToast("Aluno editado com sucesso!");
        },
        error: function (xhr, status, error) {
            console.error('Erro ao editar aluno:', error);
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

// Função para fechar a Modal de Aluno
function closeAddAlunoModal() {
    const modal = document.getElementById("addAlunoModal");
    modal.style.display = "none"; // Esconde a modal
}

// Fechar a modal se o usuário clicar fora dela
window.onclick = function(event) {
    const modal = document.getElementById("addAlunoModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Event Listener para o botão de abrir a modal
document.querySelector(".add-aluno-btn").addEventListener("click", openAddAlunoModal);

// Função para abrir a Modal de confirmação de exclusão
function openDeleteModal(alunoId) {
    // Define o ID do aluno que será excluído
    currentAlunoId = alunoId; 
    document.getElementById("confirmDeleteModal").style.display = "block"; // Exibe a modal de confirmação
}

// Função para confirmar a exclusão
function confirmDeleteAluno() {
    // Chama a função de deletar passando o ID do aluno selecionado
    deleteAluno(currentAlunoId);
}

// Função para fechar a Modal de confirmação de exclusão
function closeDeleteModal() {
    document.getElementById("confirmDeleteModal").style.display = "none";
    currentEvent = null;
}

function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    toast.textContent = message;
    toast.classList.remove('toast-error');
    toast.classList.add('toast-success', 'show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // O toast ficará visível por 3 segundos
}

function showErrorToast(message) {
    const toast = document.getElementById('errorToast');
    toast.textContent = message;
    toast.classList.remove('toast-success');
    toast.classList.add('toast-error', 'show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // O toast ficará visível por 3 segundos
}
