$(document).ready(function () {
    // Inicializa a tabela e carrega os professores assim que a página é aberta
    carregarProfessores();

    // Configuração inicial do DataTable
  
});


// Função para abrir a modal de criação de professor
function openAddProfessorModal() {

    document.getElementById('addProfessorModal').style.display = 'flex';

    // Limpa e habilita os campos
    $('#professor-siape').val('').prop('disabled', false);
    $('#professor-nome').val('');
    $('#professor-coordinator').val('no');
    
    // Configura o título e o botão do modal para "Cadastrar"
    $('#modalProfessorTitle').text("Cadastrar Novo Professor");
    $('.save-professor-button').text("Cadastrar Professor");

    // Define o evento de submit para chamar a função de cadastro
    $('#addProfessorForm').off('submit').on('submit', function (event) {
        event.preventDefault();
        cadastrarProfessor(); // Chama a função de cadastro
    });

    $('#addProfessorModal').show(); // Exibe o modal
}

// Função para cadastrar um novo professor
function cadastrarProfessor() {
    
    const siape = $('#professor-siape').val();
    const nome = $('#professor-nome').val();
    const isCoordinator = $('#professor-coordinator').val() === "yes";
    const token = localStorage.getItem('token');

    const professor = {
        siape: siape,
        nome: nome,
        coordenador: isCoordinator
    };

    $.ajax({
        type: 'POST',
        url: 'http://localhost:8081/api/professores',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        data: JSON.stringify(professor),
        success: function (response) {
            carregarProfessores();
            closeAddProfessorModal();
            showSuccessToast("Professor cadastrado com sucesso!");
        },
        error: function (xhr, status, error) {
            closeAddProfessorModal();
            showErrorToast("Erro ao cadastrar o professor.");
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function carregarProfessores() {
    const token = localStorage.getItem('token'); // Obter o token se necessário

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8081/api/professores', // URL para buscar os professores
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        success: function (data) {

            // Destroi o DataTable antes de recarregar os dados, se já estiver inicializado
            if ($.fn.DataTable.isDataTable('#professoresTable')) {
                $('#professoresTable').DataTable().clear().destroy();
            }

            // Limpa a tabela
            var tabela = $('#professoresTable tbody');
            tabela.empty();

            // Itera sobre os professores e adiciona-os à tabela
            data.forEach(function (professor) {
                var row = `
                    <tr>
                        <td>${professor.nome}</td>
                        <td>${professor.orientandos ? professor.orientandos.length : '0'}</td>
                        <td>${professor.vagas}</td>
                        <td>${professor.email}</td>
                        <td>
                            <button class="btn-action btn-edit" onclick="openEditProfessorModal(${professor.id})">Editar</button>
                            <button class="btn-action btn-delete" onclick="openDeleteModal(${professor.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                tabela.append(row);
            });

            // Reinicia o DataTable para funcionar com os novos dados
            $('#professoresTable').DataTable({
                "autoWidth": true,
                "responsive": true,
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
            console.error('Erro ao carregar os professores:', error);
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

// Função para abrir a modal de edição de professor
function openEditProfessorModal(professorId) {
    const token = localStorage.getItem('token');

    document.getElementById('addProfessorModal').style.display = 'flex';

    $.ajax({
        type: 'GET',
        url: `http://localhost:8081/api/professores/${professorId}`,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        success: function (professor) {
            // Preenche os campos com os dados do professor
            $('#professor-nome').val(professor.nome);
            $('#professor-siape').val(professor.siape).prop('disabled', true);
            $('#professor-coordinator').val(professor.coordenador ? 'yes' : 'no');

            // Configura o título e o botão do modal para "Editar"
            $('#modalProfessorTitle').text("Editar Professor");
            $('.save-professor-button').text('Salvar Alterações');

            // Adiciona a classe 'modal-edit' para aplicar o estilo no campo #professor-siape
            $('#addProfessorModal').addClass('modal-edit');

           // Define o evento de submit para chamar a função de edição e remove qualquer outro evento `submit` anterior
           $('#addProfessorForm').off('submit').on('submit', function (event) {
                event.preventDefault();
                editarProfessor(professorId); // Chama a função de edição
            });

            $('#addProfessorModal').show(); // Exibe o modal
        },
        error: function (xhr, status, error) {
            console.error('Erro ao buscar os dados do professor:', error);
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function editarProfessor(professorId) {
    const token = localStorage.getItem('token');

    // Captura os dados do formulário
    const nome = $('#professor-nome').val();
    const isCoordinator = $('#professor-coordinator').val() === "yes";

    const professor = {
        nome: nome,
        coordenador: isCoordinator
    };
    // Requisição para editar o professor
    $.ajax({
        type: 'PUT',
        url: `http://localhost:8081/api/professores/${professorId}`,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        data: JSON.stringify(professor),
        success: function () {
            carregarProfessores(); // Recarregar a tabela após editar
            closeAddProfessorModal(); // Fecha o modal
            showSuccessToast("Professor atualizado com sucesso!");
        },
        error: function (xhr, status, error) {
            showErrorToast("Erro ao editar o professor.");
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}

function deleteProfessor() {
    const token = localStorage.getItem('token');

    $.ajax({
        type: 'DELETE',
        url: `http://localhost:8081/api/professores/${currentProfessorId}`,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        beforeSend: function () {
            $('#loading').show(); // Exibe o spinner
        },
        success: function () {
            carregarProfessores(); // Recarrega a tabela após exclusão
            closeDeleteModal(); // Fecha a modal de exclusão
            showSuccessToast("Professor excluído com sucesso!");
        },
        error: function (xhr, status, error) {
            console.error('Erro ao excluir professor:', error);
            showErrorToast("Erro ao excluir o professor.");
        },
        complete: function () {
            $('#loading').hide();
        }
    });
}


// Função para fechar a modal
function closeAddProfessorModal() {
    $('#addProfessorModal').hide();

    $('#professor-nome').val(''); // Limpa o nome ao fechar a modal
    $('#professor-siape').val('').prop('disabled', false); // Limpa e habilita o Siape
    $('#professor-coordinator').val('no');

    $('#modalProfessorTitle').text("Cadastrar Novo Professor"); // Redefine o título para cadastro
    $('.save-professor-button').text("Cadastrar Professor"); // Redefine o texto do botão

    // Remove o evento de submit para evitar chamadas duplicadas
    $('#addProfessorForm').off('submit');

    // Remove a classe 'modal-edit' para que o estilo especial não seja aplicado em modo de cadastro
    $('#addProfessorModal').removeClass('modal-edit');
    
    //const modal = document.getElementById("addProfessorModal");
    //modal.style.display = "none"; // Esconde a modal
}

function openDeleteModal(professorId) {
    currentProfessorId = professorId; // Armazena o ID do professor a ser excluído
    $('#confirmDeleteModal').show(); // Mostra a modal de confirmação
}

// Função para confirmar a exclusão
function confirmDeleteProfessor() {
    // Chama a função de deletar passando o ID do professor selecionado
    deleteProfessor(currentProfessorId);
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
