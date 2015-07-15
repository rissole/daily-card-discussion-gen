// thanks for downloading 100kb of jquery for this one method ayy lamo
$('#link').on('paste', function(e) {
    setTimeout(function() {
        $('#submit').click();
    }, 0);
});

$('#resultsModal').on('show.bs.modal', function() {
    $('#resultsModal .modal-content').spin();
});

$('#resultsModal').on('hide.bs.modal', function() {
    $('#resultsModal input, #resultsModal textarea').val('');
});