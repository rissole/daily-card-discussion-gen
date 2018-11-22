// thanks for downloading 100kb of jquery for this one file ayy lamo
$('#resultsModal').on('show.bs.modal', function() {
    $('#resultsModal .modal-content').spin();
});

$('#resultsModal').on('hide.bs.modal', function() {
    $('#resultsModal input, #resultsModal textarea').val('');
});

$('#posttoreddit').click(function() {
    var postText = $('#result').val();
    if ($("#radio-output-alpha").is(":checked")) {
      postText = "(Copy and paste from generator Alpha view)";
    }
    window.open(
      'http://reddit.com/r/hearthstone/submit?selfText=true&title=%s&text=%s'
        .replace('%s', encodeURIComponent($('#result-title').val()))
        .replace('%s', encodeURIComponent(postText)),
      '_blank'
    );
});

$('#metathread').click(function() {
    window.open(
      'https://redd.it/5l7k00',
      '_blank'
    );
});

$('.update-container .tiny-button-spinner').spin('tiny');

function setSubmitEnabled(usable) {
  $('.input input').prop('disabled', !usable);
  return $('.input button').prop('disabled', !usable);
}

$('#radio-output-classic').click(function() {
  $('#result').show();
  $('#result-alpha-container').hide();
});

$('#radio-output-alpha').click(function() {
  $('#result').hide();
  $('#result-alpha-container').show();
});