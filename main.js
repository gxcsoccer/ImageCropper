var fs = require("fs");
var path = require("path");
var easyimg = require('easyimage');

$(document).ready(function() {
	var $inputFile = $("#inputFile");
	var $outputPath = $("#outputPath");

	$("#submit").on("click", function() {
		var filepath = $inputFile.val();
		var filename = path.basename(filepath);
		var destpath = path.resolve($outputPath.val(), filename);
		saveFile(filepath, destpath);
	});

});

function saveFile(src, dest) {
	easyimg.rescrop({
		src: src,
		dst: dest,
		width: 500,
		height: 500,
		cropwidth: 128,
		cropheight: 128,
		x: 0,
		y: 0
	}, function(err, image) {
		if (err) throw err;
		console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
	});
}