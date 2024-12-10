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

// Chame a função verificarOrientador ao carregar a página "Sobre"
$(document).ready(function () {
    verificarOrientador();
});
