$(document).ready(function () {
    $('#orientandosTable').DataTable({
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

    // Função para abrir a modal ao clicar no botão de visualização
    $('.view-button').click(function () {
        if (!$(this).prop('disabled')) {
            $('#viewModal').css('display', 'flex');
            // Aqui você pode adicionar o conteúdo do envio
            $('#envio-details').text('Conteúdo do envio do aluno selecionado.');
        }
    });
});

// Função para fechar a modal
function closeModal() {
    $('#viewModal').css('display', 'none');
}
