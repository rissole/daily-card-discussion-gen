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
            return isGolden ? 1600 : 400;
        case 'Legendary':
            return isGolden ? 3200 : 1600;
    }
    return 'Uncraftable';
};

var isCraftable = function(card, isGolden) {
    if (card.cardSet === 'Basic' || card.cardSet === 'Reward') {
        return false;
    }
    // hack override due to inconsistent API. ben brode should hire some better json programmers
    if (card.cardSet === 'The League of Explorers' && !isGolden) {
        return false;
    }
    if (!isGolden && 'howToGet' in card && card.howToGet.indexOf('Can be crafted') === -1) {
        return false;
    }
    if (isGolden && 'howToGetGold' in card && card.howToGetGold.indexOf('Can be crafted') === -1) {
        return false;
    }
    return true;
}

// in my dumb template, you do %if_condition% and %fi_condition%, on their own lines, around your condition.
var removeTemplateConditionalIfFalse = function(template, conditionName, conditionValue) {
    if (conditionValue) {
        return template
    }
    return template.replace(new RegExp('%if_'+conditionName+'%[\\s\\S]*?%fi_'+conditionName+'%[\\r\\n]*', 'g'), '');
}

$('#submit').on('click', function() {
    if (ALL_CARDS.length === 0) {
        console.log('Ease up turbo');
        return false;
    }
    // work out what yesterday's card was
    var previousUrl = $('#link').val();
    var previousCardMatch = /daily_card_discussion_thread_(\d+)_/.exec(previousUrl);
    var previousNumberOverride = 0;
    if (!previousCardMatch || previousCardMatch.length != 2) {
        // jeez man the instructions are pretty clear! why can't i recognise this url!
        if (previousUrl.indexOf('/3k6n5x/') > -1) {
            previousNumberOverride = 59;
        }
        else {
            return false;
        }
    }
    // vars boyz //
    var previousCardNumber = previousNumberOverride || parseInt(previousCardMatch[1], 10);
    var previousNameOverride = null;
    if (previousCardNumber === 271) {
        // shifter zerus ayy lmao nice gag mang
        // RIP Lance Carrier
        previousNameOverride = 'Shifter Zerus';
    }
    // for gag purposes I'm leaving the previous go to shifter zerus for lancer carrier,
    // because that's what shifter zerus replaced originally when it came out early.
    //if (previousCardNumber === 349) {
    //    previousNameOverride = 'Lance Carrier';
    //}
    var previousName = previousNameOverride || ALL_CARDS[previousCardNumber - 1];
    var cardNumber = previousCardNumber + 1;
    var cardName = ALL_CARDS[cardNumber - 1];
    
    // more hardcoded shifter zerus shenanigans
    if (cardName == 'Shifter Zerus' && cardNumber > 271) {
        cardName = 'Lance Carrier';
    }
    // are you actually joking me, look at this zero padding code, Guido save me shammahammalamma oh mah gahhhd
    var formattedIndex = '#' + ('000' + cardNumber.toString()).substr(-3);
    var previousFormattedIndex = '#' + ('000' + previousCardNumber.toString()).substr(-3);

    $('#cardname').text(cardName);
    $.when(
        $.get('template.htmpl'),
        $.ajax({
            url: 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/'+encodeURIComponent(cardName)+'?collectible=1',
            type: 'GET',
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "QBcxRS2k9ymshXiWiJ0GlfwTJd33p1LAgUcjsnU6IKY8olZvp0");
            }
        }),
        $.ajax({
            url: 'hh_ids.json',
            type: 'GET',
            dataType: 'json'
        })
    ).done(function(templateResponse, cardResponse, hearthheadIDMapResponse) {
        $('#resultsModal .modal-content').spin(false);
        var card = cardResponse[0][0]; //thanks dumb, but actually really useful, api. Solid NPS 9
        var template = templateResponse[0];
        var hearthheadIDMap = hearthheadIDMapResponse[0];
        var formattedText = card.text ? card.text.replace(/<b>/g, '**').replace(/<\/b>/g, '**').replace(/\$/g, '').replace(/#/g, '') : 'None';
        var formattedFlavor = card.flavor.replace(/(?:<i>)|(?:<\/i>)/g, '');
        var gamepediaLink = 'http://hearthstone.gamepedia.com/index.php?search=%c_name%&title=Special:Search&go=Go'.replace('%c_name%', encodeURIComponent(cardName))
        var hearthheadID = hearthheadIDMap[card.cardId];
        var hearthheadLink = typeof(hearthheadID) !== 'undefined' ? 'http://www.hearthhead.com/card=' + hearthheadID + '#comments' : 'http://www.hearthhead.com';

        // the most lightweight templating engine yet!! hackernews come at me
        $('#result-title').val('Daily Card Discussion Thread %formattedIndex% - %c_name% | %the_date%'
            .replace('%formattedIndex%', formattedIndex)
            .replace('%c_name%', cardName)
            .replace('%the_date%', new Date().format('mmmm dS, yyyy'))
        );

        // conditionals lol
        // removes the "if" blocks if they aren't needed
        var original_template = template;
        template = removeTemplateConditionalIfFalse(template, 'attack', 'attack' in card);
        template = removeTemplateConditionalIfFalse(template, 'health', 'health' in card);
        template = removeTemplateConditionalIfFalse(template, 'durability', 'durability' in card);
        template = removeTemplateConditionalIfFalse(template, 'craftable_normal', isCraftable(card, false));
        template = removeTemplateConditionalIfFalse(template, 'craftable_gold', isCraftable(card, true));
        template = removeTemplateConditionalIfFalse(template, 'howtoget', 'howToGet' in card);
        template = removeTemplateConditionalIfFalse(template, 'howtogetgold', 'howToGetGold' in card);
        template = template.replace(/(?:%if_.*?%[\r\n]*)|(?:%fi_.*?%[\r\n]*)/g, '');

        $('#result').val(template
            .replace(/%formatted_index%/g, formattedIndex)
            .replace(/%c_link%/g, gamepediaLink)
            .replace(/%c_name%/g, cardName)
            .replace(/%c_cost%/g, card.cost)
            .replace(/%c_attack%/g, card.attack)
            .replace(/%c_health%/g, card.health)
            .replace(/%c_durability%/g, card.durability)
            .replace(/%c_type%/g, card.type)
            .replace(/%c_text%/g, formattedText)
            .replace(/%c_class%/g, 'playerClass' in card ? card.playerClass : 'Neutral')
            .replace(/%c_race%/g, 'race' in card ? card.race : 'None')
            .replace(/%c_rarity%/g, card.rarity)
            .replace(/%c_set%/g, card.cardSet)
            .replace(/%c_flavor%/g, formattedFlavor)
            .replace(/%c_img_url%/g, card.img)
            .replace(/%c_golden_img_url%/g, card.imgGold)
            .replace(/%p_name%/g, previousName)
            .replace(/%p_formatted_index%/g, previousFormattedIndex)
            .replace(/%p_thread_link%/g, previousUrl)
            .replace(/%c_craft_cost%/g, getCraftCost(card.rarity, false))
            .replace(/%c_golden_craft_cost%/g, getCraftCost(card.rarity, true))
            .replace(/%c_how_to_get%/g, card.howToGet)
            .replace(/%c_how_to_get_gold%/g, card.howToGetGold)
            .replace(/%hearthhead_link%/g, hearthheadLink)
        );
    });
});
