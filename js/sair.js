function logout() {
    localStorage.removeItem('token'); // Remove o token do localStorage
    console.log("Logout realizado com sucesso!");
}
