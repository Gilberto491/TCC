// Variável global para armazenar o token
const token = localStorage.getItem('token');

// Função para abrir o modal
function openModal() {
    document.getElementById('tccModal').style.display = 'flex';
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('tccModal').style.display = 'none';
    resetForm(); // Limpa o formulário após fechar o modal
}

// Função para limpar o formulário
function resetForm() {
    document.getElementById('tccForm').reset();
    document.getElementById('file-name').textContent = 'Nenhum arquivo selecionado';
}

// Função para exibir o toast de sucesso
function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    toast.textContent = message || 'Operação realizada com sucesso!';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Função para exibir o toast de erro
function showErrorToast(message) {
    const toast = document.getElementById('errorToast');
    toast.textContent = message || 'Ocorreu um erro. Tente novamente.';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Atualiza o nome do arquivo selecionado
document.getElementById('fileInput').addEventListener('change', function () {
    const fileName = this.files[0] ? this.files[0].name : 'Nenhum arquivo selecionado';
    document.getElementById('file-name').textContent = fileName;
});

// Lida com a submissão do formulário
document.getElementById('tccForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Captura os dados do formulário
    const titulo = document.querySelector('input[placeholder="Título"]').value;
    const descricao = document.querySelector('textarea[placeholder="Descrição"]').value;
    const link = document.querySelector('input[placeholder="Link"]').value;
    const fileInput = document.getElementById('fileInput').files[0]; // Arquivo selecionado

    // Criação do objeto TCC
    const tccData = {
        titulo: titulo,
        descricao: descricao,
        link: link,
       // documentoUrl: fileInput ? fileInput.name : null, // Usamos apenas o nome do arquivo para exemplo
        aluno: { id: getUserIdFromToken(token) } // Relaciona ao aluno logado
    };

    // Requisição para criar o TCC
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8081/api/tccs',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(tccData),
        success: function () {
            closeModal(); // Fecha o modal
            showSuccessToast('TCC salvo com sucesso!');
            carregarTCCs(); // Recarrega a lista de TCCs
        },
        error: function (xhr) {
            console.error('Erro ao salvar TCC:', xhr);
            showErrorToast('Erro ao salvar TCC. Tente novamente.');
        }
    });
});

// Função para carregar os TCCs
function carregarTCCs() {
    const userId = getUserIdFromToken(token);

    $.ajax({
        type: 'GET',
        url: `http://localhost:8081/api/tccs`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (tccs) {
            atualizarListaTCC(tccs);
        },
        error: function (xhr) {
            console.error('Erro ao carregar TCCs:', xhr);
            showErrorToast('Erro ao carregar TCCs.');
        }
    });
}

// Função para atualizar a lista de TCCs no frontend
function atualizarListaTCC(tccs) {
    const tccList = document.querySelector('.tcc-list');
    tccList.innerHTML = ''; // Limpa a lista existente

    tccs.forEach(tcc => {
        const tccItem = document.createElement('div');
        tccItem.classList.add('tcc-item');

        tccItem.innerHTML = `
            <div class="tcc-info">
                <span class="tcc-title">${tcc.titulo}</span>
                <span class="tcc-description">${tcc.descricao}</span>
            </div>
            <div class="tcc-actions">
                <button class="edit-button" onclick="editarTCC(${tcc.id})">Editar</button>
                <button class="delete-button" onclick="excluirTCC(${tcc.id})">Excluir</button>
                <button class="share-button" onclick="shareByEmail(this)">Compartilhar</button>
            </div>
        `;

        tccList.appendChild(tccItem);
    });
}

// Função para compartilhar o TCC por e-mail
function shareByEmail(button) {
    const tccItem = button.closest('.tcc-item');
    const title = tccItem.querySelector('.tcc-title').textContent;
    const description = tccItem.querySelector('.tcc-description').textContent;

    const subject = encodeURIComponent(`Compartilhamento do TCC: ${title}`);
    const body = encodeURIComponent(`Olá,\n\nGostaria de compartilhar com você o seguinte TCC:\n\nTítulo: ${title}\nDescrição: ${description}\n\nAtenciosamente,`);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
}

// Função para excluir TCC
function excluirTCC(tccId) {
    $.ajax({
        type: 'DELETE',
        url: `http://localhost:8081/api/tccs/${tccId}`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function () {
            showSuccessToast('TCC excluído com sucesso!');
            carregarTCCs(); // Recarrega a lista
        },
        error: function (xhr) {
            console.error('Erro ao excluir TCC:', xhr);
            showErrorToast('Erro ao excluir TCC. Tente novamente.');
        }
    });
}

// Função para editar TCC
function editarTCC(tccId) {
    $.ajax({
        type: 'GET',
        url: `http://localhost:8081/api/tccs/${tccId}`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (tcc) {
            openModal();
            document.querySelector('input[placeholder="Título"]').value = tcc.titulo;
            document.querySelector('textarea[placeholder="Descrição"]').value = tcc.descricao;
            document.querySelector('input[placeholder="Link"]').value = tcc.link;
            document.getElementById('file-name').textContent = tcc.documentoUrl || 'Nenhum arquivo selecionado';
        },
        error: function (xhr) {
            console.error('Erro ao carregar TCC:', xhr);
            showErrorToast('Erro ao carregar TCC.');
        }
    });
}

// Função para obter o ID do usuário do token
function getUserIdFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

// Inicializa a lista de TCCs ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    carregarTCCs();
});
