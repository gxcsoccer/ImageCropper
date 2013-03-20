var fs = require("fs"),
	path = require("path"),
	easyimg = require('easyimage'),
	async = require("async");

$(document).ready(function() {
	var $inputFile = $("#inputFile"),
		$outputPath = $("#outputPath"),
		$inputWidth = $("#inputWidth"),
		$inputHeight = $("#inputHeight");

	$("input,textarea,select").jqBootstrapValidation({
		preventSubmit: true,
		submitError: function($form, event, errors) {
			// Here I do nothing, but you could do something like display
			// the error messages to the user, log, etc.
		},
		submitSuccess: function($form, event) {
			var filePath = $inputFile.val(),
				fileName = path.basename(filePath),
				destFolder = $outputPath.val(),
				cropWidth = +$inputWidth.val(),
				cropHeight = +$inputHeight.val();

			if (!fs.existsSync(filePath)) {
				bootbox.alert("输入文件不存在");
			} else if (!/^.png|.jpg$/.test(path.extname(filePath).toLowerCase())) {
				bootbox.alert("请输入png或者jpg格式图片");
			} else {

				mkdirSync(destFolder);

				easyimg.info(filePath, function(err, stdout, stderr) {
					if (err) {
						bootbox.alert("未知的文件格式");
					} else {
						var originWidth = stdout.width,
							originHeight = stdout.height,
							row = Math.ceil(originHeight / cropHeight),
							col = Math.ceil(originWidth / cropWidth),
							i = 0,
							cbArray = [];

						for (var h = 0; h < originHeight; h += cropHeight) {
							for (var w = 0; w < originWidth; w += cropWidth) {
								cbArray.push((function(offsetX, offsetY, index) {
									return function(callback) {
										easyimg.crop({
											src: filePath,
											dst: path.resolve(destFolder, index + fileName),
											cropwidth: cropWidth,
											cropheight: cropHeight,
											x: offsetX,
											y: offsetY,
											quality: 100,
											gravity: "NorthWest"
										}, function(err, image) {
											callback(err, image);
										});
									};
								})(w, h, i++));
							}
						}

						async.series(cbArray, function(err, results) {
							if (err) {
								bootbox.alert(err);
							} else {
								bootbox.alert("生成成功！");
							}
						});
					}
				});
			}

			event.preventDefault();
		},
		filter: function() {
			return $(this).is(":visible");
		}
	});

	$("#preview").on("click", function() {
		var obj = {
			img: $inputFile.val(),
			cropWidth: $inputWidth.val(),
			cropHeight: $inputHeight.val()
		}
		var win = window.open("preview.html", "_blank");
		win.variable = JSON.stringify(obj);
	});
});

/**
 * 创建目录
 * @param {String} url
 * @param {String} mode
 */

function mkdirSync(url, mode) {
	var path = require("path"),
		arr = url.split("/");
	mode = mode || 0755;
	if (arr[0] === ".") { //处理 ./aaa
		arr.shift();
	}
	if (arr[0] == "..") { //处理 ../ddd/d
		arr.splice(0, 2, arr[0] + "/" + arr[1])
	}

	function inner(cur) {
		if (!fs.existsSync(cur)) { //不存在就创建一个
			fs.mkdirSync(cur, mode)
		}
		if (arr.length) {
			inner(cur + "/" + arr.shift());
		}
	}
	arr.length && inner(arr.shift());
}