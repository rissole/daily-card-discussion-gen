// Initialize Firebase
var config = {
    apiKey: "AIzaSyArmgMMZP1qztDJR3QGKWOQXtfDgwDNdio",
    authDomain: "hearthstone-dcd.firebaseapp.com",
    databaseURL: "https://hearthstone-dcd.firebaseio.com",
    storageBucket: "hearthstone-dcd.appspot.com",
    messagingSenderId: "842477447647"
};
firebase.initializeApp(config);

var database = firebase.database();

function retrieveApiVersion() {
    return $.ajax({
        url: 'https://omgvamp-hearthstone-v1.p.mashape.com/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-Mashape-Authorization", "QBcxRS2k9ymshXiWiJ0GlfwTJd33p1LAgUcjsnU6IKY8olZvp0");
        }
    });
}

function retrieveAllCards() {
    return $.ajax({
        url: 'https://omgvamp-hearthstone-v1.p.mashape.com/cards?collectible=1',
        type: 'GET',
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-Mashape-Authorization", "QBcxRS2k9ymshXiWiJ0GlfwTJd33p1LAgUcjsnU6IKY8olZvp0");
        }
    });
}

function renderUpdateRequiredButton(localVersion, apiVersion) {
    var html = '<button type="button" class="btn btn-danger" title="Update required. Current patch %localVersion%"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span> New patch %apiVersion% – Click here to Update</button>'
        .replace(/%localVersion%/g, localVersion)
        .replace(/%apiVersion%/g, apiVersion);
    return $(html);
}

function renderUpToDateButton(version) {
    var html = '<button type="button" class="btn btn-success" title="Up to date with current patch"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> %version%</button>'
        .replace(/%version%/g, version);
    return $(html);
}

function getLastDiscussionIndex() {
    var prompto = '';
    while (prompto !== null && isNaN(parseInt(prompto, 10))) {
        prompto /*ma boy*/ = prompt('What is the number of the latest Daily Card Discussion?');
    }
    return prompto;
}

function flattenAllCardsResponse() {
    var newAllNames = [];
    $.each(allCardsResponse, function(set, setCards) {
        newAllNames.concat(
            setCards.filter(function(card) {
                return card.cardId.indexOf('HERO') !== -1;
            }).map(function(card) {
                return card.name;
            })
        );
    });
    return newAllNames;
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

DCDUpdater = {
    database: database,
    retrieveVersionAndCardData: function() {
        return database.ref('/').once('value');
    },
    updateUpdateRequiredUI: function(localVersion) {
        retrieveApiVersion().then(function(versionResponse) {
            var apiVersion = versionResponse.patch;
            var $button = renderUpToDateButton(localVersion);
            if (localVersion !== apiVersion) {
                $button = renderUpdateRequiredButton(localVersion, apiVersion);
                $button.click(DCDUpdater.updateCardData);
            }
            $('.update-container').html($button);
        });
    },
    updateCardData: function() {
        $('.update-container > button').prepend('<span class="tiny-button-spinner"></span>').find('span.glyphicon').remove();
        $('.tiny-button-spinner').spin('tiny');
        DCDUpdater.retrieveVersionAndCardData().then(function(versionAndCardData) {
            retrieveAllCards().then(function(allCardsResponse) {
                // remove the old names from the new list.
                $('.update-container').prepend('<span class="glyphicon glyphicon-flag"></span>').find('.tiny-button-spinner').remove();

                var lastDiscussionIndex = getLastDiscussionIndex();
                if (lastDiscussionIndex === null) {
                    return;
                }

                var oldAllNames = versionAndCardData.val().allnames.slice(0, lastDiscussionIndex);
                var newAllNames = flattenAllCardsResponse(allCardsResponse).filter(function(cardName) {
                    return oldAllNames.indexOf(cardName) !== -1;
                });

                newAllNames = oldAllNames.concat(shuffle(newAllNames));

                DCDUpdater.saveNewNames(newAllNames);
            });
        });
    },
    saveNewNames: function(allNames) {
        
    }
};
