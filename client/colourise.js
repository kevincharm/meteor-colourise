ColouriseElements = new Mongo.Collection('colouriseelements');
ignoreTags = [];

Meteor.startup(function () {
	ignoreTags = ['DIV'];
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
}

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
}

Template.colourise.onRendered(function () {
	Meteor.subscribe('colouriseelements', {
		onReady: function () {
			$('html').find('*').each(function () {
				var nodeClass = this.getAttribute('class') ? '.' + this.getAttribute('class') : null;
				var nodeId = this.getAttribute('id') ? '#' + this.getAttribute('id') : null;
				var nodeTag = this.nodeName;
				if (nodeTag && !ignoreTags.indexOf(nodeTag) && !nodeClass) {
					var newSelector = 'colourised-' + nodeTag;
					$(event.target).addClass(newSelector);
					nodeTag = null;
					nodeClass = '.' + newSelector;
				}
				if (nodeClass || nodeId) {
					var element = ColouriseElements.findOne({nodeSelector: nodeClass});
					if (element) {
						newFgColour = element.fgColour;
						newBgColour = element.bgColour;
						this.style.setProperty('color', newFgColour, 'important');
						this.style.setProperty('background-color', newBgColour, 'important');
					}
				}
			});
		}
	});
});

Template.colourise.events({
	'click .colourise-btn-update': function (event) {
		var target = Session.get('currentTarget');
		var element = target ? ColouriseElements.findOne({nodeSelector: target.selector}) : null;
		var newFgColour = $('.colourise-fg-colour').val();
		var newBgColour = $('.colourise-bg-colour').val();
		console.log('update colours: ', newFgColour, newBgColour);
		Meteor.call('updateCE', target, newFgColour, newBgColour);
		$(element.nodeSelector).each(function () {
			this.style.setProperty('color', newFgColour, 'important');
			this.style.setProperty('background-color', newBgColour, 'important');
		});
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

Template.colourise.onRendered(function () {
	$('body').click(function (event) {
		var nodeClass = event.target.getAttribute('class') ? ('.' + event.target.getAttribute('class').split(' ').join('.')) : null;
		var nodeId = event.target.getAttribute('id') ? ('#' + event.target.getAttribute('id')) : null;
		var nodeTag = event.target.nodeName ? event.target.nodeName : null;
		if (nodeTag && !ignoreTags.indexOf(nodeTag) && !nodeClass) {
			var newSelector = 'colourised-' + nodeTag;
			$(event.target).addClass(newSelector);
			nodeTag = null;
			nodeClass = '.' + newSelector;
		}
		if (nodeClass || nodeId || nodeTag) {
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
	})
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
	}
});