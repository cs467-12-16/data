// Firebase Initialization
var db = new Firebase('https://cs467group12map.firebaseio.com/');
var dataStore = db.child('data'); // For all data
var childRef;
var currIDs = [];

dataStore.on('value', function(snapshot) {
    for (var id in snapshot.val()) {
        currIDs.push(id);
    }
});

// ID generation functions
// http://jsfiddle.net/greatbigmassive/PJwg8/
function generateID() {
    var id = "";
    var length = 15;
    while (id.length < length && length > 0) {
        var randomNumber = Math.random();
        id += (randomNumber < 0.1 ? Math.floor(randomNumber * 100) : String.fromCharCode(Math.floor(randomNumber * 26) + (randomNumber > 0.5 ? 97 : 65)));
    }
    return id;
}

function saveIDToFirebase() {
    var id = generateID();
    while (currIDs.indexOf(id) >= 0) {
        id = generateID();
    }
    var ref = dataStore.child(id);
    $('.randID').text(id);
    return ref;
}

// Reveal Different Rows
function revealRow(idOfRow) {
    $('#' + idOfRow).css('display', 'block');
    if (idOfRow.indexOf('id') >= 0) {
        childRef = saveIDToFirebase();
        $('#disclaimerRow').css('display', 'none');
    } else if (idOfRow.indexOf('userInput') >= 0) {
        $('#locHistory').css('display', 'none');
    } else if (idOfRow.indexOf('locHistory') >= 0) {
        $('#userInput').css('display', 'none');
    } else if (idOfRow.indexOf('inputOptions') >= 0) {
        $('#userInputFormSubmit').css('display', 'none');
    } else if (idOfRow.indexOf('thanks') >= 0) {
        $('#locHistory').css('display', 'none');
        $('#userInput').css('display', 'none');
    }
}

function confirmSubmissionGoogle() {
    childRef.update({
        type: 'google'
    });
    revealRow('thanks');
}

function confirmSubmissionUser() {
    var events = $('#calendar').fullCalendar('clientEvents');
    for (var i = 0; i < events.length; i++) {
        var e = events[i];
        childRef.child('locations').push({
            start: e.start,
            end: e.end,
            type: e.type,
            location: e.location
        });
    }
    revealRow('thanks');
}

$(document).ready(function() {
    // Calendar setup
    $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
		defaultDate: Date.now(),
		selectable: true,
		selectHelper: true,
        ignoreTimezone: true,
		select: function(start, end) {
            //http://jsfiddle.net/mccannf/azmjv/16/
            $('#startTime').val(start);
            $('#endTime').val(end);
            console.log(start, end);
            $('#eventModal').modal('show');
		},
		editable: true,
        eventClick: function(event) {
            console.log(event);
        }
	});

    $.getJSON('json/majors.json', function(data) {
        var items = [];
        $.each(data, function(value) {
            items.push('<option value="' + data[value] + '">' + data[value] + '</option>');
        });
        $('#majorDropdown').html(items.join(""));
    });

    $('#userInputFormSubmit').on('submit', function(event) {
        event.preventDefault();
        var major = $('#majorDropdown').val();
        var year = $('#yearDropdown').val();
        var requiresDoubleMajor = $('input[name=yesnoDoublemajor]:checked').val();
        var apib = $('input[name=apib]:checked').val();
        var addlMajors, addlMinors;
        if ($('#addlMajors').val() !== undefined) {
            addlMajors = $('#addlMajors').val().split('\n');
        }
        if ($('#addlMinors').val() !== undefined) {
            addlMinors = $('#addlMinors').val().split('\n');
        }
        childRef.set({
            major: major,
            year: year,
            requiresDoubleMajor: requiresDoubleMajor,
            apib: apib,
            addlMajors: addlMajors,
            addlMinors: addlMinors,
            type: 'user'
        });
        revealRow('inputOptions');
    });

    $('#userEventForm').on('submit', function(event) {
        event.preventDefault();
        $('#eventModal').modal('hide');
        console.log($('#startTime').val());
        console.log($('#endTime').val());
        var eventData = {
            location: $('#locationOfEvent').val(),
            start: $('#startTime').val(),
            end: $('#endTime').val(),
            type: $('#activityTypeDropdown').val()
        };
        $('#calendar').fullCalendar('renderEvent', eventData, true);
    });
});