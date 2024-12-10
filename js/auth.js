// Função para verificar se o aluno está logado
function verificarAutenticacao() {
    // Verifica se o token está presente no localStorage
    var token = localStorage.getItem('token');
    
    try {
        if (!token) {
            // Redireciona para a página de login se o token não estiver presente
            window.location.href = '../login.html';
            return;
        }
    
        // Decodificar o token (assumindo que você tenha uma função de decodificação de JWT)
        var payload = parseJwt(token);
        
        if (!payload || payload.role !== 'ROLE_ALUNO') {
            // Redireciona para a página de login se o usuário não for um aluno
            window.location.href = '../login.html';
            return;
        }
    } catch (error) {
        window.location.href = '../login.html';
        console.log(error)
    }

}

// Função para decodificar o token JWT
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Pega o token do localStorage
var token = localStorage.getItem('token');

// Decodifica o token
var decodedToken = parseJwt(token);

// Chama a função para verificar se o aluno está autenticado ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    verificarAutenticacao();
});
