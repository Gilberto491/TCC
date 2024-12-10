document.addEventListener("DOMContentLoaded", function() {
    // Obtenha o token do localStorage
    const token = localStorage.getItem('token');
    
    // Função para decodificar o JWT
    function parseJwt (token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Verifica se o token existe e se tem a role de coordenador
    if (!token) {
        // Redireciona para a página de login se o token não existe
        window.location.href = '../../login.html';
    } else {
        // Decodifica o token para obter o payload
        const decodedToken = parseJwt(token);
        
        // Verifica se o token é válido e possui a role "ROLE_COORDENADOR"
        if (!decodedToken || !decodedToken.roles || !decodedToken.roles.includes("ROLE_COORDENADOR")) {
            // Redireciona para a página de login se o token não tem a role correta
            window.location.href = '../../login.html';
        }
    }
});
