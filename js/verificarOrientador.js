function verificarOrientador(token) {
    const userID = getUserIdFromToken(token); // Certifique-se de que a função `getUserIdFromToken` esteja acessível

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

// Exportar a função se necessário em um ambiente modular
if (typeof module !== 'undefined') {
    module.exports = verificarOrientador;
}
