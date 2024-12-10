$(document).ready(function () {
    // Função para fazer a requisição AJAX e popular os eventos
    var token = localStorage.getItem('token');

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
    
    $.ajax({
        type: "GET",
        url: "http://localhost:8081/api/eventos",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        beforeSend: function () {
            $('#loading').show();
            $('.agenda').hide(); // Esconde a agenda até o carregamento
        },
        success: function (eventos) {
            const eventosContainer = $('.agenda'); // Supondo que os eventos estejam dentro da classe agenda
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
                formatDiaSemana = formatDiaSemana.replace('-FEIRA', '');

                // Verificar se o evento é favoritado e adicionar a classe 'favoritado' se for true
                const favoritadoClass = evento.favoritado ? 'favoritado' : '';

                // Cria o template HTML do evento
                const eventoHTML = `
                    <div class="event ${favoritadoClass}" data-id="${evento.id}">
                        <div class="date">
                            <span class="day">${formatDia}</span>
                            <span class="weekday">${formatDiaSemana}</span>
                            <span class="month-year">${mesAno}</span>
                        </div>
                        <div class="details">
                            <p>${evento.titulo}</p>
                        </div>
                        <div class="favorite-icon">
                            <i class="fa ${evento.favoritado ? 'fa-star' : 'fa-star-o'}"></i>
                        </div>
                    </div>
                `;

                // Adiciona o evento ao container de eventos
                eventosContainer.append(eventoHTML);
            });

            // Evento de clique no ícone de favorito
            $('.favorite-icon i').off('click').on('click', function () {
                const eventElement = $(this).closest('.event');
                const eventId = eventElement.data('id');
                const isFavoritado = eventElement.hasClass('favoritado');

                // Inverter o status de favoritado
                const novoStatus = !isFavoritado;

                // Atualizar no backend via AJAX
                $.ajax({
                    type: 'POST',
                    url: `http://localhost:8081/api/eventos/${eventId}/favoritar`,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({ favoritado: novoStatus }),
                    success: function () {
                        // Atualizar a interface visual com o novo status
                        if (novoStatus) {
                            eventElement.addClass('favoritado');
                            $(eventElement).find('.fa').removeClass('fa-star-o').addClass('fa-star');
                        } else {
                            eventElement.removeClass('favoritado');
                            $(eventElement).find('.fa').removeClass('fa-star').addClass('fa-star-o');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Erro ao atualizar o status de favoritado:', error);
                    }
                });
            });
        },
        error: function (xhr, status, error) {
            if (xhr.status === 403) {
            // Se houver um erro 403, redireciona para a página de login
            window.location.href = "../login.html";
            } else {
                console.error('Erro ao buscar os eventos:', error);
            }
        },
        complete: function () {
            $('#loading').hide();
            $('.agenda').show(); // Exibe a agenda após o carregamento
        }
    });

    verificarOrientador();

});