


function ABCRubiks ( _container, _config ) {
	// this class REQUIRES jQuery to work
	if (typeof jQuery == 'undefined') {
		console.error("jQuery is not loaded");
		return;
	}

	// setup defaults
	this.container = _container;
	this.message = "ABC RUBIKS";
	this.color = "orange";
	this.nextMessage = "";
	this.messageLength = this.message.length;
	this.size = 100;
	this.angle = 16;
	this.letterSpacing = -25;
	this.lineHeight = 15;
	this.soundInterval = 5;
	this.displayOutlines = false;
	this.animationStartCounter = 0;

	this.animationOutEndCounter = 0;
	this.animationInEndCounter = 0;

	// callbacks
	this.onAnimationInBegin = _config.onAnimationInBegin || function(){};
	this.onAnimationInComplete = _config.onAnimationInComplete ||  function(){};
	this.onAnimationOutBegin = _config.onAnimationOutBegin ||  function(){};
	this.onAnimationOutComplete = _config.onAnimationOutComplete || function(){};
	
	// sounds
	this.inSound = new Howl({
		urls: ["data/sounds/in.mp3"],
		sprite: {
			a: [0, 2600],
			b: [2600, 2600],
			c: [5400, 2600]
		}
	});

	this.outSound = new Howl({
		urls: ["data/sounds/out.mp3"],
		sprite: {
			a: [0, 1400],
			b: [1400, 1400],
			c: [2800, 1400]
		}
	});
}


ABCRubiks.prototype.setSize = function( _value ) {
	this.size = _value;

	$(".sprite").each(function(){
		$(this).css({width:_value, height:_value});
	});

	this.updateLayout();
};


ABCRubiks.prototype.setAngle = function( _value ) {
	this.angle = _value;	
	this.updateLayout();
};


ABCRubiks.prototype.setMessage = function ( _message ) {

	// make sure there are no elements in the container
	if( $(this.container).children().size() > 0 ) {
		console.debug( "queue message..." )
		this.nextMessage = _message;
		this.animationStartCounter = 0;
		this.animationInEndCounter = 0;
		this.animationOutEndCounter = 0;
		this.prevLetter = '';
		
		// animate out first
		$(".sprite").each(function(){
			$(this).addClass("abcOut");
		});
	}
	else {
		this.messageLength = 0;
		this.message = _message;
		this.nextMessage = "";
		this.animationStartCounter = 0;
		this.animationInEndCounter = 0;
		this.animationOutEndCounter = 0;
		this.prevLetter = '';

		// convert to lowercase
		var lc = this.message.toLowerCase();

		// split the sentance by SPACES
		var words = lc.split(" ");
		var delay = 0;

		// create each word and append to #message
		for (var i = 0; i < words.length; i++) {		
			var $word = $("<div/>", {class:"word"});
			$word.appendTo("#message");
			
			// create each letter and append to word
			for (var j = 0; j < words[i].length; j++) {
				var letter = words[i].charAt(j);

				// validate each character
				if (this.isValid(letter)) {
					// get a valid CSS class for the letter
					var classSuffix = this.getCSSClass(letter);
					var $letter = $("<div/>", {class:"sprite abcIn sprite-"+classSuffix});
					this.createLetter( $letter, $word, delay, letter);
					// increment the current message counter
					this.messageLength++;

					// increase the delay
					delay += 0.1;
				} 
				else {
					console.log("the character '"+ letter +"' is not valid!");
				}				
			}

			if ( i < words.length-1 ) {
				// create a spacer at the end of each word
				var $spacer = $("<div/>", {class:"sprite spacer"});
				this.createLetter( $spacer, $word, 0, ' ');

				delay += 0.1;
			}
		}

		// make sure everything is in the correct place
		this.updateLayout();
	}
};


ABCRubiks.prototype.createLetter = function( $letter, $word, delay, _letter ) {
	
	$letter.appendTo($word);

	// check for close quote bug
	if (_letter == '"' && this.prevLetter != '' && this.isValid(this.prevLetter) == true) {
		_letter = '”';
	}

	// set the width and height from the config
	$letter.css({
		width : this.size, 
		height : this.size,
		marginRight : this.letterSpacing,
		backgroundPosition: "100% 0px",
		'background-image' : 'url(data/images/alphabet/' + this.color + '/' + this.getCSSClass(_letter) + '.png)',
		
		"-webkit-animation-delay":delay+"s",
		"-moz-animation-delay":delay+"s",
		"-ms-animation-delay":delay+"s",
		"-0-animation-delay":delay+"s",
		"-animation-delay":delay+"s"
	});

	if (this.displayOutlines == true) {
		$letter.css('outline','1px solid white');
	}

	// create animation event listeners
	this.addPrefixedEventListener(this, $letter.get(0), "AnimationStart", this._onAnimationStart);
	this.addPrefixedEventListener(this, $letter.get(0), "AnimationEnd", this._onAnimationEnd);

	// store the previous letter
	this.prevLetter = _letter;
};


ABCRubiks.prototype._onAnimationStart = function( _event ) {
	if ($(_event.target).hasClass("abcIn")) {
		// must be in...
		if (( this.animationStartCounter % this.soundInterval == 1 ) || ( this.animationStartCounter == this.messageLength-2 )) {
			// generate a random sound
			var k = Object.keys(this.inSound._sprite);
			var r = Math.floor(Math.random()*k.length);
			this.inSound.play(k[r]);
		}
		if (this.animationStartCounter == 0) {
			this.onAnimationInBegin.call();
		}		
	} else {
		// must be out
		if (( this.animationStartCounter % this.soundInterval == 1 ) || ( this.animationStartCounter == this.messageLength-2 )) {
			var k = Object.keys(this.outSound._sprite);
			var r = Math.floor(Math.random()*k.length);
			this.outSound.play(k[r]);
		}
		if (this.animationStartCounter == 0) {
			this.onAnimationOutBegin.call();
		}
	}

	// increment
	this.animationStartCounter++;
};


ABCRubiks.prototype._onAnimationEnd = function( _event ) {

	// console.log(_event.currentTarget.className);
	// console.log(this.animationEndCounter);

	if ( $(_event.target).hasClass("abcIn") ) {
		// must be animating in...
		$(_event.target).removeClass("abcIn").css("background-position", "0px 0px");

		// check if at the end
		// console.log(this.animationInEndCounter +"=="+ (this.messageLength-1));

		if (this.animationInEndCounter == this.messageLength-1) {
			this.onAnimationInComplete.call();
		}

		this.animationInEndCounter++;

	} else if ( $(_event.target).hasClass("abcOut") ) {
		
		// must be animating out...
		$(_event.target).removeClass("abcOut").css("background-position","100% 0px");
		
		// check if at the end

		this.animationOutEndCounter++;

		// console.log(this.animationOutEndCounter + "==" + this.messageLength);
		// console.log(_event);

		if (this.animationOutEndCounter == this.messageLength) {
			this.onAnimationOutComplete.call();

			// auto-fire the next message
			$(this.container).children().remove();
			
			if (this.nextMessage != "") {
				this.setMessage(this.nextMessage);
			}
		}
	}
};


ABCRubiks.prototype.updateLayout = function() {
	// make sure there's a message being displayed
	var container = document.getElementById("message");
	
	if( container.childNodes.length > 0 ) {
		// first set the message to the top, so the offset can be calculated
		// using 0,0 coordinates from the browser window
		$('#message').offset({top:0});

		// update the scale for all the letters
		var h = $(".sprite").height();
		var letterCount = 0;
		var prevRow = 0;

		$(".sprite").each(function(){
			// first set the position to static to reset the offset
			$(this).css('position','static');

			var position = Math.floor( $(this).position().top );
			var row = Math.floor( position / h );

			// check row to adjust offetY
			if ( prevRow != row ) {
				// new row, so reset counter
				letterCount = 0;
				prevRow = row;
			}

			/*// update the width to account for the tightness with the angle
			console.log(abc.angle * 20);
			var a = abc.letterSpacing + (abc.angle * 20);
			$(this).css({marginRight:a});*/

			// position the letter
			// $(this).offset({top:(i*abc.angle']) + (row * abc.lineHeight']) });
			var offsetY = (row * abc.size); //row
			offsetY += row * abc.lineHeight; // line-height
			offsetY += letterCount * abc.angle; //angle
			$(this).offset({top:offsetY});

			// increment the count AFTER setting the offsetn
			letterCount++;
		});

		$('#message').css('position','static');

		var windowHeight = $(window).height();
		var messageHeight = $('#message .word:last-child .sprite:last-child').offset().top + h;

		if ( messageHeight < windowHeight ) {
			// align the #message div in the middle vertically
			$('#message').offset({top:(windowHeight/2) - (messageHeight/2)});
		}
	}
};


ABCRubiks.prototype.replayMessage = function() {
	$('.sprite').css('background-position',"100% 0px").addClass('abcIn');
};


ABCRubiks.prototype.loadRandomMessage = function() {
	var messages = [
	"abcdefghijklmnopqrstuvwxyz",
	"6 colored sides", 
	"26 pieces", 
	"54 outer faces", 
	"A standard ‘3x3x3’ Rubik’s Cube has 6 colored sides, 26 pieces and 54 outer surfaces.", 
	"The Rubik’s cube has 43,252,003,274,489,856,000 possible configurations",
	"There is only 1 correct answer and 43 quintillion wrong ones for Rubik's Cube.",
	"One eighth of the world's population has laid hands on 'The Cube'",
	"‘Cubaholics’ are said to suffer from ‘Rubik's wrist’ and ‘Cubist's thumb’!",
	"There is also a dedicated art movement known as ‘Rubikubism’.",
	"Rubik's Cube was first called the Magic Cube (Buvuos Kocka) in Hungary.",
	"Cubic Rubes (the name of cube fans) formed clubs to play and study solutions.",
	"The quick brown fox jumps over the lazy dog.",
	"Have a pick: twenty six letters — no forcing a jumbled quiz! (46 letters)"
	];
	var r =  Math.random() * (messages.length-1);
	var m = messages[ Math.floor( r ) ];

	if (this.message == m) {
		// pick a different message
		console.log("Rand: identical message, picking another");
		this.loadRandomMessage();
	}
	else
	{
		// set the new message
		console.log("Rand: new message generated");
		this.setMessage( m );
	}
};


ABCRubiks.prototype.loadMessageJSON = function( _urlMessageID ) {
	$.getJSON("data/scripts/getYourMessage.php", {mid:_urlMessageID}, function (json) {
		
		// set the loaded data in to the system
		abc.size = parseInt(json.size);
		abc.letterSpacing = parseInt(json.letterSpacing);
		abc.lineHeight = parseInt(json.lineHeight);
		abc.angle = parseInt(json.angle);
		abc.setMessage( json.message );

	});
};


ABCRubiks.prototype.preloadImages = function( _callback ) {
	var letterPrefix = new Array(
		"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
		"1","2","3","4","6","7","8","9",
		"COMMA", "PERIOD", "EXCLAMATION", "QUESTION", "APOSTROPHE"
		);

	var images = new Array();
	var imageCounter = 0;

	for (var i = 0; i < letterPrefix.length; i++) {
		images[i] = new Image();
		images[i].onload = function(){
			imageCounter++;
			if ( imageCounter == images.length ) {
				_callback.call();
			}
		};
		images[i].src = "data/images/alphabet/" + this.color + "/" + letterPrefix[i] + ".png";
	};
};


ABCRubiks.prototype.addPrefixedEventListener = function( _this, _element, _type, _callback ) {
	// Custom listener to handle different browser prefixes
	// http://bit.ly/1bqtKwJ
	var pfx = ["webkit", "moz", "MS", "o", ""];
	var obj = {
		handleEvent: function(e) {
			_callback.call(_this, e);
		}
	};

	for (var p = 0; p < pfx.length; p++) {
		if (!pfx[p]) _type = _type.toLowerCase();
		_element.addEventListener(pfx[p]+_type, obj, false);
	}
};


ABCRubiks.prototype.isValid = function(_letter) {
	var result = /[^A-Za-z0-9\,.!?']/.test(_letter);
	return !result;
};


ABCRubiks.prototype.getCSSClass = function( _letter ) {
	// check for punctuation
	switch( _letter ) {
		case ',' :
		return "COMMA";
		break;

		case '.' :
		return "PERIOD";
		break;

		case '?' :
		return "QUESTION";
		break;

		case '!' :
		return "EXCLAMATION";
		break;

		case "'" :
		case "’" :
		return "APOSTROPHE";
		break;

		case "5" :
		return "s";
		break;

		case "0" :
		return "o";
		break;

		default :
			// just return the original letter
			return _letter;
			break;
		}			
	};


