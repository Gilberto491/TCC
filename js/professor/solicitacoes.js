$(document).ready(function () {
    // Obter o token do localStorage (ou onde você armazena o token JWT)
    var token = localStorage.getItem('token');
    var userId = getUserIdFromToken(token); // Pega o ID do professor do token JWT
   
    // Inicializa o DataTable
    var table = $('#solicitacoesTable').DataTable({
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

    // Função para carregar as solicitações via AJAX
    function carregarSolicitacoes() {
        var token = localStorage.getItem('token');
        var userId = getUserIdFromToken(token);

        $.ajax({
            type: 'GET',
            url: `http://localhost:8081/api/solicitacoes/professor/${userId}`, // Endpoint para obter as solicitações
            headers: {
                'Authorization': 'Bearer ' + token // Envia o token no cabeçalho
            },
            beforeSend: function () {
                $('#loading').show();
                $('.table-container').hide();  // Esconde o conteúdo até o carregamento
            },
            success: function (data) {
                
                $('#loading').hide();
                $('.table-container').show();

                // Limpar a tabela antes de preencher
                table.clear().draw();

                if (data.length === 0) {
                    // Se não houver mais solicitações, exibir uma mensagem (opcional)
                    table.row.add([
                        'Nenhuma solicitação encontrada',
                        '-',
                        '-'
                    ]).draw(false);
                } else {
                    // Itera sobre as solicitações e adiciona-as à tabela
                    data.forEach(solicitacao => {
                        const dataFormatada = new Date(solicitacao.dataCriacao).toLocaleDateString();
                        const visualizarButton = `<button class="view-button" style="margin-right: 7px;" onclick="openViewModal('${solicitacao.titulo}', '${solicitacao.descricao}')">Visualizar</button>`;
                        const aceitarButton = `<button class="accept-button" style="margin-right: 7px;" onclick="openConfirmModal(${solicitacao.id}, 'Aceitar')">Aceitar</button>`;
                        const recusarButton = `<button class="reject-button" onclick="openConfirmModal(${solicitacao.id}, 'Recusar')">Recusar</button>`;

                        table.row.add([
                            solicitacao.aluno.nome,    // Nome do aluno
                            dataFormatada,             // Data formatada
                            `<div class="actions-container">${visualizarButton + aceitarButton + recusarButton}</div>`  // Contêiner flex para botões
                        ]).draw(false);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar as solicitações:', error);
            }
        });
    }

    // Função para pegar o ID do professor a partir do token JWT
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

    // Carregar as solicitações ao carregar a página
    carregarSolicitacoes();
    carregarLimiteOrientandos();
    // Variável para armazenar o limite original
    verificarMudancaLimite(); // Verifica se o valor foi alterado
});

    var limiteOriginal = null;

 // Função para mostrar o Toast de Sucesso
 function showToast(message) {
        const toast = document.getElementById('successToast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // O toast ficará visível por 3 segundos
    }

    // Função para abrir a modal de visualização
    function openViewModal(title, description) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-description').textContent = description;
        document.getElementById('viewModal').style.display = 'flex';
    }

    // Função para fechar a modal de visualização
    function closeViewModal() {
        document.getElementById('viewModal').style.display = 'none';
    }

// Função para abrir a modal de confirmação
    function openConfirmModal(solicitacaoId, action) {
    document.getElementById('confirmModal').style.display = 'flex';

    // Altera o texto da mensagem e define a ação de confirmação
    const modalMessage = document.getElementById('confirm-modal-message');
    modalMessage.textContent = `Tem certeza que deseja ${action.toLowerCase()} esta solicitação?`;

    document.getElementById('confirm-yes').onclick = function () {
        if (action === 'Aceitar') {
            aceitarSolicitacao(solicitacaoId);
        } else if (action === 'Recusar') {
            recusarSolicitacao(solicitacaoId);
        }
        closeConfirmModal();
    };
}

// Função para fechar o modal de confirmação
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Funções para aceitar e recusar solicitações (você pode adaptar de acordo com o backend)
function aceitarSolicitacao(solicitacaoId) {
    var token = localStorage.getItem('token');
    $.ajax({
        type: 'POST',
        url: `http://localhost:8081/api/solicitacoes/${solicitacaoId}/aceitar`,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function () {
            showToast('Solicitação aceita com sucesso!');
            carregarSolicitacoes(); // Recarregar as solicitações após aceitar
        },
        error: function () {
            showToast('Erro ao aceitar a solicitação!');
        }
    });
}

// Função para carregar o número de vagas do professor e preencher o limite
function carregarLimiteOrientandos() {
    var token = localStorage.getItem('token');
    var userId = getUserIdFromToken(token);
    
    $.ajax({
        type: 'GET',
        url: `http://localhost:8081/api/professores/${userId}/vagas`, // Endpoint para pegar o número de vagas
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            $('#orientandos-limit').val(response);
            limiteOriginal = response; // Armazena o limite original do banco
            verificarMudancaLimite(); // Verifica se o limite mudou

        },
        error: function () {
            console.error('Erro ao carregar o limite de orientandos.');
        }
    });
}


function verificarMudancaLimite() {
    const limiteAtual = $('#orientandos-limit').val();

    // Compara o limite atual com o original e habilita/desabilita o botão
    if (limiteAtual != limiteOriginal) {
        $('.save-limit-button').prop('disabled', false).addClass('btn-enabled').removeClass('btn-disabled'); // Habilita o botão
    } else {
        $('.save-limit-button').prop('disabled', true).addClass('btn-disabled').removeClass('btn-enabled'); // Desabilita o botão
    }
}

// Evento para detectar alterações no campo de limite
$('#orientandos-limit').on('input', function () {
    verificarMudancaLimite(); // Verifica se o valor foi alterado
});

function recusarSolicitacao(solicitacaoId) {
    var token = localStorage.getItem('token');
    $.ajax({
        type: 'DELETE',
        url: `http://localhost:8081/api/solicitacoes/${solicitacaoId}`,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function () {
            showToast('Solicitação recusada com sucesso!');
            carregarSolicitacoes(); // Recarregar as solicitações após recusar
        },
        error: function () {
            showToast('Erro ao recusar a solicitação!');
        }
    });
}

// Função para abrir a modal de confirmação do novo limite
function openConfirmLimitModal() {
    document.getElementById('confirmNewLimitModal').style.display = 'flex';
}

// Função para fechar a modal de confirmação do novo limite
function closeConfirmLimitModal() {
    document.getElementById('confirmNewLimitModal').style.display = 'none';
}

// Função para confirmar e salvar o novo limite de orientandos
function confirmNewLimit() {
    const novoLimite = $('#orientandos-limit').val();
    var token = localStorage.getItem('token');
    var userId = getUserIdFromToken(token);

    $.ajax({
        type: 'PUT',
        url: `http://localhost:8081/api/professores/${userId}/vagas`,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ vagas: novoLimite }), // Enviar o novo limite
        success: function () {
            showToast('Limite atualizado com sucesso!');
            closeConfirmLimitModal();
        },
        error: function () {
            showToast('Erro ao atualizar o limite.');
        }
    });
}

// Função para pegar o ID do professor a partir do token JWT
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

