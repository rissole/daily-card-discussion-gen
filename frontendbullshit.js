// thanks for downloading 100kb of jquery for this one method ayy lamo
$('#link').on('paste', function(e) {
    setTimeout(function() {
        $('#submit').click();
    }, 0);
});

$('#resultsModal').on('show.bs.modal', function() {
    $('#resultsModal .modal-content').spin();
});

$('#link').val('https://www.reddit.com/r/hearthstone/comments/3d5q28/daily_card_discussion_thread_002_malygos_july/');