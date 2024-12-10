$(document).ready(function () {
    var token = localStorage.getItem('token');

    document.querySelector('.close-button').addEventListener('click', closeModal);
    
    verificarOrientador();
    // Carregar os professores ao carregar a página, dependendo se o aluno tem solicitação ou não
    carregarProfessores();

    // Função para verificar se o aluno tem orientador
    function verificarOrientador() {
        const userID = getUserIdFromToken(token);
    
        $.ajax({
            type: "GET",
            url: `http://localhost:8081/api/alunos/tcc/${userID}`, // Endpoint para verificar se o aluno tem orientador
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            beforeSend: function () {
                $('#loading').show();
            },
            success: function (temOrientador) {
                if (temOrientador) {
                    // Se o aluno tem um orientador, habilita o link
                    $('#tcc-link').addClass('enabled').removeClass('disabled').off('click');
                } else {
                    // Se não tiver orientador, desabilita o link
                    $('#tcc-link').removeClass('enabled').addClass('disabled').on('click', function (event) {
                        event.preventDefault(); // Evita o redirecionamento
                        alert('Você precisa ter um orientador antes de enviar seu TCC.');
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao verificar o orientador:', error);
                alert('Erro ao verificar o orientador. Tente novamente mais tarde.');
            },
            complete: function () {
                $('#loading').hide();
            }
        });
    }
    
    
    // Função para carregar professores ou solicitação via AJAX
    function carregarProfessores() {
        const userId = getUserIdFromToken(token);
        
        $.ajax({
            type: 'GET',
            url: `http://localhost:8081/api/solicitacoes/aluno/${userId}`,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            beforeSend: function () {
                $('#loading').show();  // Mostra o carregador
                $('.table-container').hide();  // Esconde o conteúdo
            },
            success: function (solicitacao) {
                const tabela = $('#orientadoresTable thead tr');
                tabela.empty(); // Limpa os cabeçalhos da tabela
                
                if (solicitacao && solicitacao.aceita === true) {
                    // Define o cabeçalho com "Status"
                    tabela.append(`
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Status</th>
                    `);
                    
                    const corpoTabela = $('#orientadoresTable tbody');
                    corpoTabela.empty(); // Limpa o corpo da tabela
                    
                    // Exibe o professor com o status "Aceito"
                    corpoTabela.append(`
                        <tr>
                            <td>${solicitacao.professor.nome}</td>
                            <td>${solicitacao.professor.email}</td>
                            <td>Aceito</td>
                        </tr>
                    `);
                } else {
                    // Cabeçalho padrão quando não há solicitação aceita
                    tabela.append(`
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Vagas</th>
                        <th>Ações</th>
                    `);
                    
                    carregarTodosProfessores(); // Carrega todos os professores
                }
            }
            ,
            error: function (xhr, status, error) {
                console.error('Erro ao verificar solicitação:', error);
                carregarTodosProfessores(); // fallback
            },
            complete: function () {
                $('#loading').hide();  // Esconde o carregador
                $('.table-container').show();  // Exibe o conteúdo novamente
            }
        });
    }

    // Função para mostrar apenas o professor da solicitação pendente
    function mostrarProfessorSolicitacao(professor) {
        const tabela = $('#orientadoresTable tbody');
        tabela.empty(); // Limpa a tabela
        console.log(professor)
        // Insere o professor com status de solicitação pendente
        tabela.append(`
            <tr>
                <td>${professor.nome}</td>
                <td>${professor.email}</td>
                <td>Pendente</td>
                <td><button class="teste request-button disabled" disabled>Solicitação Pendente</button></td>
            </tr>
        `);

        reiniciarDataTable(); // Reinicializa o DataTable
    }

    // Função para carregar todos os professores
    function carregarTodosProfessores() {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8081/api/professores',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            beforeSend: function () {
                $('#loading').show();
                $('.table-container').hide();  // Esconde o conteúdo até o carregamento
            },
            success: function (data) {

                $('#loading').hide();
                $('.table-container').show();

                const tabela = $('#orientadoresTable tbody');
                tabela.empty(); // Limpa a tabela

                data.forEach(professor => {
                    // Verifique se o campo booleano (por exemplo, 'coordenador') é false antes de exibir
                    if (!professor.coordenador) { // Substitua 'coordenador' pelo nome correto do campo booleano
                        tabela.append(`
                            <tr data-professor-id="${professor.id}">
                                <td>${professor.nome}</td>
                                <td>${professor.email}</td>
                                <td>${professor.vagas}</td>
                                <td><button class="request-button">Solicitar</button></td>
                            </tr>
                        `);
                    }
                });
                

                reiniciarDataTable(); // Reinicializa o DataTable
                configurarBotoesSolicitacao(); // Adiciona eventos aos botões
            },
            error: function (xhr, status, error) {
                if (xhr.status === 403) {
                    // Se houver um erro 403, redireciona para a página de login
                    window.location.href = "../login.html";
                    } else {
                        console.error('Erro ao buscar os eventos:', error);
                    }
            }
        });
    }

    // Função para reinicializar o DataTable
    function reiniciarDataTable() {
        if ($.fn.DataTable.isDataTable('#orientadoresTable')) {
            $('#orientadoresTable').DataTable().destroy(); // Destroi a instância existente
        }

        $('#orientadoresTable').DataTable({
            "paging": true,
            "searching": true,
            "ordering": true,
            "language": {
                "search": "Pesquisar:",
                "lengthMenu": "Mostrar _MENU_ registros por página",
                "zeroRecords": "Nenhum registro encontrado",
                "info": "Mostrando página _PAGE_ de _PAGES_",
                "infoEmpty": "Nenhum registro disponível",
                "infoFiltered": "(filtrado de _MAX_ registros no total)",
                "paginate": {
                    "previous": "Anterior",
                    "next": "Próximo"
                }
            }
        });

        // Verificar vagas e adicionar eventos após carregar os dados
        checkVagas();
    }

    // Função para abrir a modal de solicitação
    function openModal(professorId) {
        document.getElementById('solicitarModal').style.display = 'flex';
        document.getElementById('solicitarForm').reset();
        $('#professorId').val(professorId); // Armazena o professorId para a solicitação
    }

    // Função para fechar a modal
    function closeModal() {
        document.getElementById('solicitarModal').style.display = 'none';
    }

    $('#solicitarForm').on('submit', function (e) {
        e.preventDefault();
        const titulo = $('#titulo').val();
        const descricao = $('#descricao').val();
        const professorId = $('#professorId').val();
        const userId = getUserIdFromToken(token); // Definindo userId corretamente

        $.ajax({
            type: 'POST',
            url: 'http://localhost:8081/api/solicitacoes',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                titulo: titulo,
                descricao: descricao,
                alunoId: userId, // Usando o userId correto
                professorId: professorId
            }),
            beforeSend: function () {
                $('#loading').show();
                $('.table-container').hide();
            },
            success: function () {
                closeModal();
                location.reload();
                showSuccessToast();
            },
            error: function () {
                closeModal();
                showErrorToast();
            },
            complete: function () {
                $('#loading').hide();
                $('.table-container').show();
            }
        });
    });

    // Função para pegar o ID do usuário a partir do token JWT
    function getUserIdFromToken(token) {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('Token JWT malformado');
            return null;
        }

        const payloadBase64 = tokenParts[1];
        const payloadDecoded = atob(payloadBase64);
        const payload = JSON.parse(payloadDecoded);

        return payload.userId;
    }

    // Toasts de sucesso e erro
    function showSuccessToast() {
        const toast = document.getElementById('successToast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function showErrorToast() {
        const toast = document.getElementById('errorToast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Função para verificar vagas e desabilitar botões conforme necessário
    function checkVagas() {
        // Itera sobre todas as linhas da tabela
        document.querySelectorAll('#orientadoresTable tbody tr').forEach(row => {
            const vagas = parseInt(row.children[2].textContent); // Obtém o valor das vagas
            const button = row.querySelector('.request-button'); // Seleciona o botão de solicitar
            const professorId = row.getAttribute('data-professor-id');  // Obtém o ID do professor
            // Verifica se as vagas são 0
            if (vagas === 0) {
                button.classList.add('disabled'); // Adiciona a classe de desabilitado
                button.disabled = true; // Desabilita o botão
            } else {
                button.addEventListener('click', function () {
                    openModal(professorId);  // Abre a modal e passa o professorId
                });
            }
        });
    }

    // Função para configurar os botões de solicitação
    function configurarBotoesSolicitacao() {
        $('#orientadoresTable tbody').on('click', '.request-button', function () {
            const professorId = $(this).closest('tr').data('professor-id');
            openModal(professorId); // Abre a modal para o professor correspondente
        });
    }

});
