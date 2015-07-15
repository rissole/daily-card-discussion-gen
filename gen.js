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

var getCraftCost = function(rarity, isGolden) {
    switch(rarity) {
        case 'Common':
            return isGolden ? 400 : 40;
        case 'Rare':
            return isGolden ? 800 : 100;
        case 'Epic':
            return isGolden ? 400 : 1600;
        case 'Legendary':
            return isGolden ? 1600 : 3200;
    }
    return 'Uncraftable';
};

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
    var cardName = ALL_CARDS[cardNumber - 1];
    // are you actually joking me, look at this zero padding code, Guido save me shammahammalamma oh mah gahhhd
    var formattedIndex = '#' + ('000' + cardNumber.toString()).substr(-3);
    var previousFormattedIndex = '#' + ('000' + previousCardNumber.toString()).substr(-3);

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
    ).done(function(templateResponse, cardResponse) {
        $('#resultsModal .modal-content').spin(false);
        var card = cardResponse[0][0]; //thanks dumb, but actually really useful, api. Solid NPS 9
        var template = templateResponse[0];
        var formattedText = card.text ? card.text.replace(/<b>/g, '**').replace(/<\/b>/g, '**') : 'None';
        var gamepediaLink = 'http://hearthstone.gamepedia.com/index.php?search=%c_name%&title=Special:Search&go=Go'.replace('%c_name%', encodeURIComponent(cardName))

        // the most lightweight templating engine yet!! hackernews come at me
        $('#result-title').val('Daily Card Discussion Thread %formattedIndex% - %c_name% | %the_date%'
            .replace('%formattedIndex%', formattedIndex)
            .replace('%c_name%', cardName)
            .replace('%the_date%', new Date().format('dd mmmm, yyyy'))
        );

        // conditionals lol
        var original_template = template;
        if (!('attack' in card)) {
            template = template.replace(/%if_attack%[\s\S]*?%fi_attack%[\r\n]*/g, '');
        }
        if (!('health' in card)) {
            template = template.replace(/%if_health%[\s\S]*?%fi_health%[\r\n]*/g, '');
        }
        if (!('durability' in card)) {
            template = template.replace(/%if_durability%[\s\S]*?%fi_durability%[\r\n]*/g, '');
        }
        // if craftable means, rarity is not Free
        if (!(card.rarity !== 'Free')) {
            template = template.replace(/%if_craftable%[\s\S]*?%fi_craftable%[\r\n]*/g, '');
        }
        template = template.replace(/(?:%if_.*?%)|(?:%fi_.*?%[\r\n]*)/g, '');

        $('#result').val(template
            .replace(/%intro%/g, INTRO)
            .replace(/%formatted_index%/g, formattedIndex)
            .replace(/%c_link%/g, gamepediaLink)
            .replace(/%c_name%/g, cardName)
            .replace(/%c_cost%/g, 'cost' in card ? card.cost : '0')
            .replace(/%c_attack%/g, card.attack)
            .replace(/%c_health%/g, card.health)
            .replace(/%c_durability%/g, card.durability)
            .replace(/%c_type%/g, card.type)
            .replace(/%c_text%/g, formattedText)
            .replace(/%c_class%/g, 'playerClass' in card ? card.playerClass : 'Neutral')
            .replace(/%c_race%/g, 'race' in card ? card.race : 'None')
            .replace(/%c_rarity%/g, card.rarity)
            .replace(/%c_set%/g, card.cardSet)
            .replace(/%c_flavor%/g, card.flavor)
            .replace(/%c_img_url%/g, card.img)
            .replace(/%c_golden_img_url%/g, card.imgGold)
            .replace(/%p_name%/g, previousName)
            .replace(/%p_formatted_index%/g, previousFormattedIndex)
            .replace(/%p_thread_link%/g, previousUrl)
            .replace(/%c_craft_cost%/g, getCraftCost(card.rarity, false))
            .replace(/%c_golden_craft_cost%/g, getCraftCost(card.rarity, true))
        );
    });
});
