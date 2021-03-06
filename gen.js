// should be fine we all have fast internet around here
// not fine now that we're firebased
var ALL_CARDS = [];

setSubmitEnabled(false).find('span').css('color', 'transparent').spin('small', '#000');
 DCDUpdater.retrieveVersionAndCardData().then(function(versionAndCards) {
    versionAndCards = versionAndCards.val();
    var cards = versionAndCards.allnames;
    ALL_CARDS = cards;
    setSubmitEnabled(true).find('span').css('color', '#000').spin(false);

    //DCDUpdater.updateUpdateRequiredUI(versionAndCards.version);
}, function(error) {
    $('#submit').find('span').css('color', '#000').text('Error, try reloading');
    console.error(error);
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
        return template;
    }
    return template.replace(new RegExp('%if_'+conditionName+'%[\\s\\S]*?%fi_'+conditionName+'%[\\r\\n]*', 'g'), '');
}

var formatCardText = function(cardText) {
    return cardText
        .replace(/<b>/g, '**')
        .replace(/<\/b>/g, '**')
        .replace(/\$/g, '')
        .replace(/#/g, '')
        .replace(/\\n/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\[x\]/g, '');
}

var formatCardTextAlpha = function(cardText) {
    return cardText
        .replace(/\$/g, '')
        .replace(/#/g, '')
        .replace(/\\n/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\[x\]/g, '');
}

var formatTemplate = 
    function(template, card, cardName, formattedIndex, formattedText, formattedFlavor,
        previousName, previousFormattedIndex, previousUrl, gamepediaLink, hearthheadLink) {
    // conditionals lol
    // removes the "if" blocks if they aren't needed
    template = removeTemplateConditionalIfFalse(template, 'attack', 'attack' in card);
    template = removeTemplateConditionalIfFalse(template, 'health', 'health' in card);
    template = removeTemplateConditionalIfFalse(template, 'durability', 'durability' in card);
    template = removeTemplateConditionalIfFalse(template, 'craftable_normal', isCraftable(card, false));
    template = removeTemplateConditionalIfFalse(template, 'craftable_gold', isCraftable(card, true));
    template = removeTemplateConditionalIfFalse(template, 'howtoget', 'howToGet' in card);
    template = removeTemplateConditionalIfFalse(template, 'howtogetgold', 'howToGetGold' in card);
    template = template.replace(/(?:%if_.*?%[\r\n]*)|(?:%fi_.*?%[\r\n]*)/g, '');

    return template
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
        .replace(/%hearthhead_link%/g, hearthheadLink);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

var findCardNameInAllNames = function(cardName) {
    if (ALL_CARDS.includes(cardName)) {
        return cardName;
    } else {
        var maxSimilarity = 0;
        var similarName = null;
        ALL_CARDS.forEach(function(name) {
            var s = similarity(cardName, name.toLowerCase());
            if (s > maxSimilarity) {
                similarName = name;
                maxSimilarity = s;
            }
        });
        if (maxSimilarity > 0.5) {
            return similarName;
        } else {
            return '';
        }
    }
}

$('#submit').on('click', function() {
    // work out what yesterday's card was
    $('#name-error').html('');
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
    var cardName = $('#in-cardname').val().toLowerCase();
    var similarName = findCardNameInAllNames(cardName);
    if (cardName !== similarName.toLowerCase()) {
        if (!similarName) {
            $('#name-error').html("We couldn't find a card with that name.");
        } else {
            $('#name-error').html("We couldn't find a card with that name. Did you mean <strong>"+similarName+"</strong>?");
        }
        return false;
    }
    cardName = similarName;
    
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
        $.get('template-alpha.htmpl')
    ).done(function(templateResponse, cardResponse, templateAlphaResponse) {
        $('#resultsModal .modal-content').spin(false);
        var card = cardResponse[0][0]; //thanks dumb, but actually really useful, api. Solid NPS 9
        var template = templateResponse[0];
        var formattedText = card.text ? formatCardText(card.text) : 'None';
        var formattedFlavor = card.flavor.replace(/(?:<i>)|(?:<\/i>)/g, '');
        var gamepediaLink = 'http://hearthstone.gamepedia.com/index.php?search=%c_name%&title=Special:Search&go=Go'.replace('%c_name%', encodeURIComponent(cardName));
        var hearthheadName = cardName.replace(/[^a-zA-Z ]/g, '').replace(/ /, '-').toLowerCase();
        var hearthheadLink = 'http://www.hearthhead.com/cards/' + hearthheadName;

        // the most lightweight templating engine yet!! hackernews come at me
        $('#result-title').val('Daily Card Discussion Thread %formattedIndex% - %c_name% | %the_date%'
            .replace('%formattedIndex%', formattedIndex)
            .replace('%c_name%', cardName)
            .replace('%the_date%', new Date().format('mmmm dS, yyyy'))
        );

        $('#result').val(
            formatTemplate(
                template, card, cardName, formattedIndex, formattedText, formattedFlavor,
                previousName, previousFormattedIndex, previousUrl, gamepediaLink, hearthheadLink
            )
        );

        //alpha layout stuff
        var templateAlpha = templateAlphaResponse[0];
        var formattedTextAlpha = card.text ? formatCardTextAlpha(card.text) : 'None';

        $('#result-alpha').html(
            formatTemplate(
                templateAlpha, card, cardName, formattedIndex, formattedTextAlpha, formattedFlavor,
                previousName, previousFormattedIndex, previousUrl, gamepediaLink, hearthheadLink
            )
        );

    });
});
