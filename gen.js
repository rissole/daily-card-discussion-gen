var INTRO = '**Introduction**\n\n'
            + 'Hello and welcome to the "Daily Card Discussion Thread", because people upvoted this suggestion a lot, I thought I could come a long and manage it and if people like it I will continue to post daily.\n\n'
            + 'Cards selected will be random cards in the game until we literally go through every card *(Neutrals, class, spells, secrets, creatures, tokens)*\n\n'
            + 'At the bottom of each thread you can navigate to the previous card to continue it\'s discussion there.\n\n'
            + 'Because this is a community idea, please leave any suggestions down below to improve this thread.';

// should be fine we all have fast internet around here
var ALL_CARDS = [];
$.getJSON('allnames.json').done(function(cards) {
    ALL_CARDS = cards;
});

$('#submit').on('click', function() {
    if (ALL_CARDS.length === 0) {
        console.log('Ease up turbo');
        return false;
    }
    // work out what yesterday's card was
    var previousUrl = $('#link').val();
    var previousCardMatch = /daily_card_discussion_thread_(\d+)_/.exec(previousUrl);
    if (!previousCardMatch || previousCardMatch.length != 2) {
        // jeez man the instructions are pretty clear! why can't i recognise this url!
        return false;
    }
    // vars boyz //
    var previousCardNumber = parseInt(previousCardMatch[1], 10);
    var previousName = ALL_CARDS[previousCardNumber - 1];
    var cardNumber = previousCardNumber + 1;
    var sCardNumber = cardNumber.toString();
    var cardName = ALL_CARDS[cardNumber - 1];
    // are you actually joking me, look at this zero padding code, Guido save me shammahammalamma oh mah gahhhd
    var formatted_index = '#' + ('000'+sCardNumber).substr(-3);

    $('#cardname').text(cardName);
    $.when(
        $.get('template.htmpl'),
        $.ajax({
            url: 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/'+encodeURIComponent(cardName),
            type: 'GET',
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "QBcxRS2k9ymshXiWiJ0GlfwTJd33p1LAgUcjsnU6IKY8olZvp0"); // Enter here your Mashape key
            }
        })
    ).done(function(template, card) {
        $('#resultsModal .modal-content').spin(false);
        card = card[0]; //thanks dumb, but actually really useful, api
        var formatted_text = card.text.replace(/<b>/g, '**').replace(/<\/b>/g, '**');

        // the most lightweight templating engine yet!! hackernews come at me
        $('#result-title').val('Daily Card Discussion Thread %formatted_index% - %c_name% | %the_date%'
            .replace('%formatted_index%', formatted_index)
            .replace('%c_name%', cardName)
            .replace('%the_date%', new Date().format('dd mmmm, yyyy'))
        );
        $('#result').val(template
            .replace('%intro%', INTRO)
            .replace('%formatted_index%', formatted_index)
            .replace('%c_name%', cardName)
            .replace('%c_cost%', card.cost)
            .replace('%c_attack%', card.attack)
            .replace('%c_health%', card.health)
            .replace('%c_type%', card.type)
            .replace('%c_text%', formatted_text)
            .replace('%c_class%', card.playerClass ? card.playerClass : 'Neutral')
            .replace('%c_race%', card.race ? card.race : 'None')
            .replace('%c_rarity%', card.rarity)
            .replace('%c_set%', card.set)
            .replace('%c_flavor%', card.flavor)
            .replace('%c_img_url%', card.img)
            .replace('%c_golden_img_url%', card.imgGold)
            .replace('%c_golden_img_url%', card.imgGold)
            .replace('%p_name%', previousName)
        );
    });
});