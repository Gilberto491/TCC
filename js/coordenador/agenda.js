// Variável global para armazenar o evento sendo manipulado
let currentEvent = null;
let token = localStorage.getItem('token');  // Pegue o token armazenado

$(document).ready(function () {

    carregarEventos();  // Carregar os eventos ao carregar a página

    // Função para carregar todos os eventos
    function carregarEventos() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8081/api/eventos",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            beforeSend: function () {
                $('#loading').show(); // Exibe o spinner
            },
            success: function (eventos) {
                const eventosContainer = $('.agenda');
                eventosContainer.html(''); // Limpa o conteúdo anterior

                // Ordenar os eventos pela data (ascendente)
                eventos.sort(function (a, b) {
                    const dataA = new Date(a.data);
                    const dataB = new Date(b.data);
                    return dataA - dataB;
                });

                eventos.forEach(function (evento) {
                    const partesData = evento.data.split('-');
                    const dataEvento = new Date(partesData[0], partesData[1] - 1, partesData[2]);

                    const formatDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(dataEvento);
                    const mesAno = dataEvento.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase().replace('.', '').replace(' DE ', '/');
                    let formatDiaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dataEvento).toUpperCase();
                    formatDiaSemana = formatDiaSemana.replace('-FEIRA', '');  // Remover "-FEIRA"

                    const eventoHTML = `
                        <div class="event" data-id="${evento.id}">
                            <div class="date">
                                <span class="day">${formatDia}</span>
                                <span class="weekday">${formatDiaSemana}</span>
                                <span class="month-year">${mesAno}</span>
                            </div>
                                <div class="details">
                                    <p>${evento.titulo}</p>
                                </div>
                             <div class="buttons-container">
                                <button class="edit-button" onclick="openEditModal(${evento.id})">Editar</button>
                                <button class="delete-button" onclick="confirmDelete(${evento.id})">Excluir</button>
                            </div>
                        </div>
                    `;
                    eventosContainer.append(eventoHTML);
                });
            },
            error: function (xhr, status, error) {
                if (xhr.status === 403) {
                    // Se houver um erro 403, redireciona para a página de login
                    window.location.href = "../../login.html";
                    } else {
                        console.error('Erro ao buscar os eventos:', error);
                    }
            },
            complete: function () {
                $('#loading').hide();
            }
        });
    }

     // Função para abrir o modal de adicionar evento
     window.openAddEventModal = function () {
        $('#addEventModal').show();  // Exibir o modal
        $('#modalTitle').text('Adicionar Novo Evento');  // Definir o título do modal
        $('#save-button').text('Salvar');  // Definir o texto do botão de salvar
        $('#eventTitle').val('');  // Limpar o campo do título
        $('#eventDate').val('');  // Limpar o campo da data
        currentEvent = null;  // Limpar o evento atual
    }

    // Função para fechar o modal de adicionar evento
    window.closeAddEventModal = function () {
        $('#addEventModal').hide();  // Esconder o modal
        currentEvent = null;  // Limpar o evento atual
    }

    // Função para abrir o modal de edição de evento
    window.openEditModal = function (id) {
        var token = localStorage.getItem('token');
        $.ajax({
            type: "GET",
            url: `http://localhost:8081/api/eventos/${id}`,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            beforeSend: function () {
                $('#loading').show(); // Exibe o spinner
            },
            success: function (evento) {
                $('#addEventModal').show(); // Mostra o mesmo modal de adicionar evento
                $('#modalTitle').text('Editar Evento');
                $('#save-button').text('Salvar Alterações');
                $('#eventTitle').val(evento.titulo); // Preenche o título no modal
                $('#eventDate').val(evento.data); // Preenche a data no modal
                currentEvent = evento; // Armazena o evento atual que está sendo editado
            },
            error: function () {
                alert("Erro ao buscar evento.");
            },
            complete: function () {
                $('#loading').hide();
            }
        });
    }


    // Submeter o formulário de adicionar ou editar evento
    $('#addEventForm').on('submit', function (e) {
        e.preventDefault();
        const titulo = $('#eventTitle').val();
        const data = $('#eventDate').val();
        var token = localStorage.getItem('token');

        if (currentEvent) {
            // Se estiver editando, faça uma requisição PUT para atualizar
            $.ajax({
                type: "PUT",
                url: `http://localhost:8081/api/eventos/${currentEvent.id}`,
                contentType: "application/json",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Authorization': 'Bearer ' + token
                },
                beforeSend: function () {
                    $('#loading').show(); // Exibe o spinner
                },
                data: JSON.stringify({ titulo: titulo, data: data }),
                success: function () {
                    closeAddEventModal();
                    carregarEventos();
                    mostrarToast("Evento atualizado com sucesso!");
                },
                error: function () {
                    alert("Erro ao editar evento.");
                },
                complete: function () {
                    $('#loading').hide();
                }
            });
        } else {
            // Se não estiver editando, faça uma requisição POST para criar um novo evento
            $.ajax({
                type: "POST",
                url: "http://localhost:8081/api/eventos",
                contentType: "application/json",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Authorization': 'Bearer ' + token
                },
                beforeSend: function () {
                    $('#loading').show(); // Exibe o spinner
                },
                data: JSON.stringify({ titulo: titulo, data: data }),
                success: function () {
                    closeAddEventModal();
                    carregarEventos();
                    mostrarToast("Evento adicionado com sucesso!");
                },
                error: function () {
                    alert("Erro ao adicionar evento.");
                },
                complete: function () {
                    $('#loading').hide();
                }
            });
        }
    });

    // Função para excluir evento
    window.confirmDelete = function (id) {
        $('#confirmDeleteModal').show();
        $('#confirmDeleteModal').data('eventoId', id);
    }

    window.deleteEvent = function () {
        const id = $('#confirmDeleteModal').data('eventoId');
        $.ajax({
            type: "DELETE",
            url: `http://localhost:8081/api/eventos/${id}`,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            beforeSend: function () {
                $('#loading').show(); // Exibe o spinner
            },
            success: function () {
                closeDeleteModal();
                carregarEventos();
                mostrarToast("Evento excluído com sucesso!");
            },
            error: function () {
                console.error("Erro ao excluir evento.");
            },
            complete: function () {
                $('#loading').hide();
            }
        });
    }

    // Fechar modais
    window.closeAddEventModal = function () {
        $('#addEventModal').hide();
        $('#modalTitle').text('Adicionar Novo Evento');
        $('#save-button').text('Salvar');
        currentEvent = null;
    }

    window.closeDeleteModal = function () {
        $('#confirmDeleteModal').hide();
    }

    // Função para mostrar o Toast
    function mostrarToast(mensagem) {
        const toast = $('#toast');
        toast.text(mensagem);
        toast.addClass('show');
        setTimeout(function () {
            toast.removeClass('show');
        }, 3000);
    }
});
