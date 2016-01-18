// thanks for downloading 100kb of jquery for this one file ayy lamo
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

$('#posttoreddit').click(function() {
    window.open(
      'http://reddit.com/r/hearthstone/submit?selfText=true&title=%s&text=%s'
        .replace('%s', encodeURIComponent($('#result-title').val()))
        .replace('%s', encodeURIComponent($('#result').val())),
      '_blank'
    );
});

$('#metathread').click(function() {
    window.open(
      'https://www.reddit.com/r/hearthstone/comments/41ee18/list_of_all_daily_card_discussion_threads_v2/',
      '_blank'
    );
});