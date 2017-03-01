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
    var html = '<button type="button" class="btn btn-danger" title="Update required. Current patch %localVersion%" data-api-version="%apiVersion%"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span> New patch %apiVersion% – Click here to Update</button>'
        .replace(/%localVersion%/g, localVersion)
        .replace(/%apiVersion%/g, apiVersion);
    return $(html);
}

function getApiVersionFromUpdateRequiredButton() {
    return $('button[data-api-version]').attr('data-api-version');
}

function renderUpToDateButton(version, numberOfJustUpdatedCards) {
    var justUpdatedMessage = '';
    if (numberOfJustUpdatedCards === 0) {
        justUpdatedMessage = '| Success. No new cards this time though, must\'ve been just balance changes.';
    } else if (numberOfJustUpdatedCards) {
        justUpdatedMessage = '| Success. Wow, new expansion? We added ' + numberOfJustUpdatedCards + ' new cards!';
    }
    var html = '<button type="button" class="btn btn-success" title="Up to date with current patch"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> %version% %justUpdatedMessage%</button>'
        .replace(/%version%/g, version)
        .replace(/%justUpdatedMessage%/g, justUpdatedMessage);
    return $(html);
}

function getLastDiscussionIndex() {
    var prompto = '';
    while (prompto !== null && isNaN(parseInt(prompto, 10))) {
        prompto /*ma boy*/ = prompt('[IMPORTANT, DON\'T GET THIS WRONG] What is the number of the latest Daily Card Discussion?');
    }
    var confirmo = prompto !== null && confirm('Are you sure? Getting it wrong means /u/hypersniper will have to fix things manually.');

    return prompto;
}

function flattenAllCardsResponse(allCardsResponse) {
    var newAllNames = [];
    $.each(allCardsResponse, function(set, setCards) {
        Array.prototype.push.apply(newAllNames,
            setCards.filter(function(card) {
                return card.cardId.indexOf('HERO') === -1;
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
    return a;
}

DCDUpdater = {
    database: database,
    retrieveVersionAndCardData: function() {
        return database.ref('/').once('value');
    },
    updateUpdateRequiredUI: function(localVersion, numberOfJustUpdatedCards) {
        retrieveApiVersion().then(function(versionResponse) {
            var apiVersion = versionResponse.patch;
            var $button = renderUpToDateButton(localVersion, numberOfJustUpdatedCards);
            if (localVersion !== apiVersion) {
                $button = renderUpdateRequiredButton(localVersion, apiVersion);
                $button.click(function() {
                    $button.prop('disabled', true);
                    DCDUpdater.updateCardData();
                });
            }
            $('.update-container').html($button);
        });
    },
    updateCardData: function() {
        $('.update-container > button').prepend('<span class="tiny-button-spinner"></span>').find('span.glyphicon').remove();
        $('.tiny-button-spinner').spin('tiny');
        DCDUpdater.retrieveVersionAndCardData().then(function(versionAndCardData) {
            retrieveAllCards().then(function(allCardsResponse) {
                var newVersion = $('button[data-api-version]').attr('data-api-version');
                if (!newVersion) {
                    alert('Update failed: Missing new version. Refresh and try again.');
                    return;
                }

                // remove the old names from the new list.
                var lastDiscussionIndex = getLastDiscussionIndex();
                if (lastDiscussionIndex === null) {
                    $('.update-container > button').prepend('<span class="glyphicon glyphicon-flag"></span>').find('.tiny-button-spinner').remove();
                    $('.update-container > button').prop('disabled', false);
                    return;
                }

                var oldAllNames = versionAndCardData.val().allnames.slice(0, lastDiscussionIndex);
                var newAllNames = flattenAllCardsResponse(allCardsResponse).filter(function(cardName) {
                    return oldAllNames.indexOf(cardName) === -1;
                });

                newAllNames = oldAllNames.concat(shuffle(newAllNames));

                DCDUpdater.saveNewNames(versionAndCardData.val(), newVersion, newAllNames, function() {
                    $('.update-container > button').prepend('<span class="glyphicon glyphicon-flag"></span>').find('.tiny-button-spinner').remove();
                });
            });
        });
    },
    saveNewNames: function(oldVersionAndCardData, version, allNames, cb) {
        database.ref('/').set({
            backup: oldVersionAndCardData,
            lastUpdated: (new Date()).toUTCString(),
            allnames: allNames,
            version: version
        }, function(error) {
            if (error) {
                alert('Update failed: ' + error + ". Refresh and try again.");
            } else {
                var oldNames = oldVersionAndCardData.allnames;
                var newNames = allNames;
                var numberOfNewCardsAdded = newNames.filter(function(name) {
                    return oldNames.indexOf(name) === -1;
                }).length;
                DCDUpdater.updateUpdateRequiredUI(version, numberOfNewCardsAdded);
            }
            cb && cb();
        });
    }
};
