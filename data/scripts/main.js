var gui;
var sizeGUI;
var angleGUI;
var messageGUI;
var colorGUI;
var abc;
var messageCount = 0;
var userPromptID;


$(document).ready(function(){

	// create an abc instance
	abc = new ABCRubiks('#message', {
		onAnimationInBegin : function(){
			// update the gui elements
			sizeGUI.setValue( abc.size );
			angleGUI.setValue( abc.angle );
			messageGUI.setValue( abc.message );

			// dim the control pannel, after ABC RUBIKS REVEAL
			if (messageCount > 0) {
				$(gui.domElement).fadeTo(400,0.5);
				$('#userLoader').show();
			}			
		},
		onAnimationInComplete : function(){
			if (messageCount == 0) {
				// Get a message from the URL
				var urlMessage = getQuerystring('m');
				var urlMessageID = getQuerystring('mid');

				if (urlMessageID) {
					$('#userPrompt p').html("Loading your message...");
				} else {
					$('#userPrompt p').html("Loading the " + abc.color + " typeface...");
				}

				// preload
				abc.preloadImages(function(){
					if (urlMessage) {
						// write the specified message from URL
						abc.setMessage( urldecode( urlMessage ) );
					}
					else if (urlMessageID) {
						// load the message from the DB
						abc.loadMessageJSON( urlMessageID );
					}
					else {
						// write a random message
						abc.loadRandomMessage();
					}
					
					// $('#userPrompt').remove();
					$('#userPrompt').hide();
					gui.open();
				});

			} else {
				$(gui.domElement).fadeTo(400,1);
				$('#userLoader').hide();

				// if this is the first message, start a counter
				// UX advice if the user doesn't interact at all
				if (messageCount == 1) {
				
					// user message
					userPromptID = setTimeout(function(){
						$('#userPrompt p').html("You can use the controls on the right to create your own messages!<br/>&rarr;");
						$("#userPrompt").show();
					}, 10000);

					// override message
					$(gui.domElement).click(function(){
						clearTimeout(userPromptID);
						$("#userPrompt").hide();
						// remove event listener
						$(this).off("click");
					});
				}
			}
		},
		onAnimationOutBegin : function(){
			// dim the control pannel, after ABC RUBIKS REVEAL
			if (messageCount > 0) {
				$(gui.domElement).fadeTo(400,0.5);
				$('#userLoader').show();
			}
		},
		onAnimationOutComplete : function(){
			if (messageCount == 0) {
				$('#message').css('text-align','left');
			}
			messageCount += 1;
		}
	});

	$('#sendYourMessageButton').click(function(){
		$('#sendYourMessageWrapper').show();
		return false;
	});

	$('#sendYourMessageForm .close').click(function(){
		$('#sendYourMessageWrapper').hide();
		return false;
	});

	$("#sendYourMessageFill").click(function(){
		$('#sendYourMessageWrapper').hide();
		return false;
	});

	$('#sendYourMessageForm form').submit(function(){
		// create an object to hold all the data
		var postData = {
			friendEmail:$('#friendEmail').val(), 
			yourEmail:$('#yourEmail').val(),
			subject:$('#subject').val(),
			message: abc.message,
			size: abc.size,
			angle: abc.angle,
			letterSpacing: abc.letterSpacing,
			lineHeight: abc.lineHeight
		};

		$.post( "data/scripts/sendYourMessage.php", postData, function( data ) {
			if (data == 'OK') {
				gui.close();
				alert( "Great, your message has been sent." );
			} else {
				alert( "There was a small problem sending your message. Can you try again?" );
				console.log(data);
			}
			$('#sendYourMessageWrapper').hide();
		});
		return false;
	});

});


$(window).load(function(){

	// first thing to do is check browser version	
	var requireUpgrade = false;

	console.log(bowser);

	if (bowser.firefox && bowser.version < 28) {
	  requireUpgrade = true;
	}
	else if (bowser.chrome && bowser.version < 35) {
		requireUpgrade = true;
	}

	if (requireUpgrade == true) {
		$("#userPrompt p").html("For the best experience you should upgrade to the most up-to-date version of " + bowser.name + ". <br/><br/><a href=\"#\" onClick=\"skipUpgrade();\">Continue anyway</a>");
	}
	else {
		init();
	}
});


function init() {
	// wait until the intro letters have loaded then remove from DOM
	$("#message").children().remove();
	
	// initialise the GUI 
	gui = new dat.GUI();
	var guiObj = {
		
		color : "orange",
		message : "",

		submit : function(){
			if (abc.color != guiObj.color ||
				abc.message != guiObj.message) {
				
				// set the new colour
				abc.color = guiObj.color;
				abc.message = guiObj.message;

				// tell the user
				$('#userPrompt p').html("Loading the " + abc.color + " typeface...");
				$('#userPrompt').show();
				abc.preloadImages(function(){
					// replay the existing message but in the new colour
					$('#userPrompt').hide();
					abc.setMessage( abc.message );

					// change the button colour
					$('#sendYourMessageButton, #sendYourMessageForm input.submit, #sendYourMessageForm .border').css({'color':buttonColor[abc.color], 'outline-color':buttonColor[abc.color]});
				});
			} else {
				// just replay
				abc.replayMessage();
			}
		},
		randomize : function(){
			abc.loadRandomMessage();
		},
		replay : function(){
			abc.replayMessage();
		}
	}

	messageGUI = gui.add(guiObj, 'message');

	// button colours
	var buttonColor = {
		'orange':'#ff6c00',
		'blue':'#00e7de',
		'green':'#b2e900',
		'pink':'#f0006d',
		'purple':'#9e00f0'};

	colorGUI = gui.add( guiObj , "color", ["orange", "blue", "green", "pink", "purple"]);

	sizeGUI = gui.add(abc, 'size', 75, 125);
	sizeGUI.onChange(function( _value ){
		abc.setSize( _value );
	});

	angleGUI = gui.add(abc, 'angle', 0, 20);
	angleGUI.onChange(function( _value ){
		abc.setAngle( _value );
	});

	gui.add(guiObj, "randomize");
	gui.add(guiObj, "submit");
	// gui.add(guiObj, "replay");
	
	gui.close();

	// then animate in ABC RUBIKS
	$("#userPrompt p").html("Loading&hellip;<br>Please turn your volume up");
	abc.setMessage("ABC RUBIKS");
}


/* =====================================================
UTILS 
===================================================== */

function skipUpgrade(){
	$("#userPrompt").hide();
	init();
}

// Get URL Parameters
// http://bit.ly/1ijKAhP
function getQuerystring(key, default_) {
	if (default_==null) default_=""; 
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null)
		return default_;
	else
		return qs[1];
}

// Decodes a URL in to regular text
// http://stackoverflow.com/a/4458580
function urldecode(str) {
	return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}