ColouriseElements = new Mongo.Collection('colouriseelements');
ColourisePalette = new Mongo.Collection('colourisepalette');
ignoreTags = [];

Meteor.startup(function () {
	ignoreTags = ['DIV'];
	Session.set('colouriseVisible', true);
	Session.set('currentColourSelector', '.colourise-fg-colour');
	Meteor.subscribe('colourisepalette', {
		onReady: function () {
			if (!ColourisePalette.findOne({})) {
				Meteor.call('insertColour', '#2196F3');
				Meteor.call('insertColour', '#F44336');
				Meteor.call('insertColour', '#4CAF50');
				Meteor.call('insertColour', '#FFC107');
			}
		}
	});
});

$.cssHooks.color = {
    get: function(elem) {
        if (elem.currentStyle)
            var fg = elem.currentStyle["color"];
        else if (window.getComputedStyle)
            var fg = document.defaultView.getComputedStyle(elem, null).getPropertyValue("color");

        if (fg.search("rgb") == -1)
            return fg;
        else {
            fg = fg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            if (fg) {
            	return "#" + hex(fg[1]) + hex(fg[2]) + hex(fg[3]);
            } else {
            	return 'none';
            }
        }
    }
};

$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem, null).getPropertyValue("background-color");

        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            if (bg) {
            	return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
            } else {
            	return 'none';
            }
        }
    }
};

colouriseEverything = function () {
	$('html').find('*').each(function () {
		var nodeClass = this.getAttribute('class') ? '.' + this.getAttribute('class').split(' ').join('.') : null;
		var nodeId = this.getAttribute('id') ? '#' + this.getAttribute('id') : null;
		var nodeTag = this.nodeName;
		if (nodeTag && (ignoreTags.indexOf(nodeTag) == -1) && !nodeClass) {
			var newSelector = 'colourised-' + nodeTag;
			$(event.target).addClass(newSelector);
			nodeTag = null;
			nodeClass = '.' + newSelector;
		}
		if (nodeClass || nodeId) {
			var element = ColouriseElements.findOne({nodeSelector: nodeClass || nodeId});
			if (element) {
				newFgColour = element.fgColour;
				newBgColour = element.bgColour;
				if (element.nodeEnabled) {
					this.style.setProperty('color', newFgColour, 'important');
					this.style.setProperty('background-color', newBgColour, 'important');
				}
			}
		}
	});
};

Tracker.autorun(function () {
	if (Session.get('colouriseVisible')) {
		$('.colourise-box').css('visibility', 'visible');
		$('.colourise-box, .colourise-picker').animate({
			'marginRight': '30px'
		}, 200, function () {
			$('.colourise-box, .colourise-picker').animate({
				'marginRight': '0px'
			}, 200);
		});
	} else {
		$('.colourise-box, .colourise-picker').animate({
			'marginRight': '-500px'
		}, 200, function () {
			$('.colourise-box, .colourise-picker').css('visibility', 'hidden');
		});
	}
});

Tracker.autorun(function () {
	if (Session.get('resetColours')) {
		Session.set('resetColours', false);
		location.reload();
	}
});

Template.colourise.onRendered(function () {
	var ctrlDown = false;
    var ctrlKey = 17, shortcutKey = 186;

    $(document).keydown(function(e)
    {
        if (e.keyCode == ctrlKey) ctrlDown = true;
        if (ctrlDown && e.keyCode == shortcutKey) {
        	Session.set('colouriseVisible', !Session.get('colouriseVisible'));
        }
    }).keyup(function(e)
    {
        if (e.keyCode == ctrlKey) ctrlDown = false;
    });
    $(document).click(function (event) {
    	if (event.target.getAttribute('class') != 'colourise-box') $('.colourise-picker').css('visibility', 'hidden');
    });
	$('body').click(function (event) {
		var nodeClass = event.target.getAttribute('class') ? ('.' + event.target.getAttribute('class').split(' ').join('.')) : null;
		var nodeId = event.target.getAttribute('id') ? ('#' + event.target.getAttribute('id')) : null;
		var nodeTag = event.target.nodeName ? event.target.nodeName : null;
		if (nodeTag && (ignoreTags.indexOf(nodeTag) == -1) && !nodeClass) {
			var newSelector = 'colourised-' + nodeTag;
			$(event.target).addClass(newSelector);
			nodeTag = null;
			nodeClass = '.' + newSelector;
		}
		if (nodeClass || nodeId) {
			Session.set('currentTarget', {
				type: nodeClass ? 'class' : nodeId ? 'id' : nodeTag ? 'tag' : null,
				selector: nodeClass || nodeId || nodeTag || null
			});
			var target = Session.get('currentTarget');
			var targetFgColour = $(target.selector).css('color');
			var targetBgColour = $(target.selector).css('background-color');

			if (ColouriseElements.findOne({nodeSelector: target.selector})) {
				Meteor.call('updateCE', target, targetFgColour, targetBgColour);
			} else {
				Meteor.call('insertCE', target, targetFgColour, targetBgColour)
			}
			event.stopPropagation;
		} else {
			Session.set('currentTarget', null);
		}
	});
	Meteor.subscribe('colouriseelements', {
		onReady: function () {
			colouriseEverything();
		}
	});
});

Template.colourise.events({
	'click .colourise-btn-update': function (event) {
		var target = Session.get('currentTarget');
		var element = target ? ColouriseElements.findOne({nodeSelector: target.selector}) : null;
		var newFgColour = $('.colourise-fg-colour').val();
		var newBgColour = $('.colourise-bg-colour').val();
		Meteor.call('updateCE', target, newFgColour, newBgColour);
		$(element.nodeSelector).each(function () {
			this.style.setProperty('color', newFgColour, 'important');
			this.style.setProperty('background-color', newBgColour, 'important');
		});
	},
	'click .colourise-btn-reset': function (event) {
		Meteor.call('resetCE', function (err, res) {
			Session.set('resetColours', res);
		});
	},
	'click .clrs-picker-colour': function (event) {
		$(Session.get('currentColourSelector')).val($(event.target).attr('data-colour'));
		$('.colourise-picker').css('visibility', 'hidden');
		$('.colourise-btn-update').trigger('click');
	},
	'click .clrs-text-input': function (event) {
		$('.colourise-picker').css('visibility', 'hidden');
		$('.colourise-picker').animate({
			'marginRight': '10px'
		}, 100);
		Session.set('currentColourSelector', '.' + event.target.getAttribute('class').split(' ').join('.'));
		$('.colourise-picker').animate({
			'marginRight': '0px'
		}, 100);
		$('.colourise-picker').css('visibility', 'visible');
	},
	'click': function (event) {
		event.stopImmediatePropagation();
	},
	'keyup': function (event) {
		if (event.which == 13) {
			$('.colourise-btn-update').trigger('click');
		}
		event.stopImmediatePropagation();
	}
});

Template.colourise.helpers({
	currentTargetType: function () {
		var target = Session.get('currentTarget');
		return target ? target.type : '';
	},
	currentTargetSelector: function () {
		var target = Session.get('currentTarget');
		return target ? target.selector : '';
	},
	getTargetFgColour: function () {
		var target = Session.get('currentTarget');
		var element = target ? ColouriseElements.findOne({nodeSelector: target.selector}) : null;
		return element ? element.fgColour : '';
	},
	getTargetBgColour: function () {
		var target = Session.get('currentTarget');
		var element = target ? ColouriseElements.findOne({nodeSelector: target.selector}) : null;
		return element ? element.bgColour : '';
	},
	getColourPalette: function () {
		return ColourisePalette.find({});
	}
});