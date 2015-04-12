ColouriseElements = new Mongo.Collection(null);

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

Template.colourise.events({
	'click .colourise-btn-update': function (event) {
		var target = Session.get('currentTarget');
		var element = target ? ColouriseElements.findOne({nodeSelector: target.selector}) : null;
		var newFgColour = $('.colourise-fg-colour').val();
		var newBgColour = $('.colourise-bg-colour').val();
		console.log('update colours: ', newFgColour, newBgColour);
		$(element.nodeSelector).css('color', newFgColour);
		$(element.nodeSelector).css('background-color', newBgColour);
	},
	'click': function (event) {
		event.stopImmediatePropagation();
	}
});

Template.colourise.onRendered(function () {
	$('body').click(function (event) {
			if (event.target.getAttribute('class') || event.target.getAttribute('id')) {
				var nodeClass = '.' + event.target.getAttribute('class').split(' ').join('.');
				var nodeId = '#' + event.target.getAttribute('id');
				Session.set('currentTarget', {
					type: nodeClass ? 'class' : nodeId ? 'id' : null,
					selector: nodeClass || nodeId || null
				});
				var target = Session.get('currentTarget');
				var targetFgColour = $(target.selector).css('color');
				var targetBgColour = $(target.selector).css('background-color');
				if (ColouriseElements.findOne({nodeSelector: target.selector})) {
					ColouriseElements.update({nodeSelector: target.selector}, {$set: {
						fgColour: targetFgColour ? targetFgColour : '',
						bgColour: targetBgColour ? targetBgColour : ''
					}});
				} else {
					ColouriseElements.insert({
						nodeSelector: target.selector,
						nodeEnabled: true,
						fgColour: targetFgColour ? targetFgColour : '',
						bgColour: targetBgColour ? targetBgColour : ''
					});
				}
				event.stopPropagation;
			} else {
				Session.set('currentTarget', null);
			}
		}
	)
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