ColouriseElements = new Mongo.Collection('colouriseelements');
ColourisePalette = new Mongo.Collection('colourisepalette');

Meteor.publish('colouriseelements', function () {
	return ColouriseElements.find({});
});

Meteor.publish('colourisepalette', function () {
	return ColourisePalette.find({});
});

Meteor.methods({
	insertCE: function (target, targetFgColour, targetBgColour) {
		// make this take an array
		//_.each(targetFgColour, function (colour) {
			ColouriseElements.insert({
				nodeSelector: target.selector,
				nodeEnabled: true,
				fgColour: targetFgColour ? targetFgColour : '',
				bgColour: targetBgColour ? targetBgColour : ''
			});
		//});
	},
	updateCE: function (target, targetFgColour, targetBgColour) {
		ColouriseElements.update({nodeSelector: target.selector}, {$set: {
			nodeEnabled: true,
			fgColour: targetFgColour ? targetFgColour : '',
			bgColour: targetBgColour ? targetBgColour : ''
		}}, {upsert: true});
	},
	resetCE: function () {
		ColouriseElements.remove({});
		return true;
	},
	insertColour: function (newColour) {
		ColourisePalette.update({colour: newColour}, {$set: {colour: newColour}}, {upsert: true});
	},
	resetColours: function (newColour) {
		ColourisePalette.remove({});
	}
});