
/* Game Util Functions

This script requires the 2D Vectors script to work.

*/

// Basic math

function snap(min, x, max) {
	if(x < min) return min;
	if(x > max) return max;
	return x;
}

function normalizeRotation(angle) {
	angle %= Math.PI * 2;
	if(angle < 0) angle += Math.PI * 2;
	return angle;
}

function interp(a, b, t) {
	return a*(1-t) + b*t;
}

// Arrays

function filter(array, selector) {
	var newArray = [];
	for(var i = 0; i < array.length; i++) {
		if(selector(array[i])) {
			newArray.push(array[i]);
		}
	}
	return newArray;
}

function selectGreatest(array, ranker) {
	if(array.length === 0) {
		console.log("Couldn't find the greatest of none.");
		console.trace();
		return null;
	}
	var greatest = array[0];
	var rank = ranker(greatest);
	for(var i = 1; i < array.length; i++) {
		var newRank = ranker(array[i]);
		if(newRank > rank) {
			greatest = array[i];
			rank = newRank;
		}
	}
	return greatest;
}

function sort(array, greaterThan) {
	if(array.length <= 10) {
		for(var i = 1; i < array.length; i++) {
			for(var j = i - 1; j >= 0; j--) {
				if(greaterThan(array[j], array[j + 1])) {
					var tmp = array[j];
					array[j] = array[j + 1];
					array[j + 1] = tmp;
				}
			}
		}
		return array;
	}
	var pivot = array[Math.floor(array.length / 2)];
	var less = [];
	var more = [];
	for(var i = 0; i < array.length; i++) {
		if(greaterThan(array[i], pivot)) {
			more.push(array[i]);
		} else {
			less.push(array[i]);
		}
	}
	return sort(less, greaterThan).concat(sort(more, greaterThan));
}

function doBoxesIntersect(objA, objB) {
	// Too far to the left
	if(objA.pos.x + objA.box.x < objB.pos.x - objB.box.x) return false;
	// Too far to the right
	if(objA.pos.x - objA.box.x > objB.pos.x + objB.box.x) return false;
	// Too far above
	if(objA.pos.y + objA.box.y < objB.pos.y - objB.box.y) return false;
	// Too far below
	if(objA.pos.y - objA.box.y > objB.pos.y + objB.box.y) return false;
	// Object A overlaps object B in some way
	return true;
}

function forEachIntersectingBox(object, array, action) {
	for(var i = 0; i < array.length; i++) {
		if(doBoxesIntersect(object, array[i])) action(object, array[i]);
	}
}

function forEachPair(arr, func) {
	for(var i = 1; i < arr.length; i++) {
		for(var j = 0; j < i; j++) {
			func(arr[i], arr[j]);
		}
	}
}

// Canvas

var ctx;

function initCanvas(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext("2d");
}

function initCanvasFullscreen(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");
}

function translate(ctx, vector) {
	ctx.translate(vector.x, vector.y);
}

// Vectors

function bindObjectToCanvas(object, canvas) {
	if(object.pos.x < object.box.x) object.pos.x = object.box.x;
	if(object.pos.x > canvas.width - object.box.x) object.pos.x = canvas.width - object.box.x;
	if(object.pos.y < object.box.y) object.pos.y = object.box.y;
	if(object.pos.y > canvas.height - object.box.y) object.pos.y = canvas.height - object.box.y;
}

// More Math

function generateRotationTransform(rotation) {
	var xVector = V.trig(rotation, 1);
	var yVector = V.trig(rotation + Math.PI/2, 1);
	return {
		X: xVector,
		Y: yVector
	};
}

function applyRotationTransform(vector, transform) {
	var xPart = transform.X.scale(vector.x);
	var yPart = transform.Y.scale(vector.y);
	return V.add(xPart, yPart);
}

function getRotatableBoxCorners(box) {
	var corners = [];
	corners.push(new V(box.boxOffset));
	corners.push(new V(box.boxOffset.x + box.boxSize.x, box.boxOffset.y));
	corners.push(V.add(box.boxOffset, box.boxSize));
	corners.push(new V(box.boxOffset.x, box.boxOffset.y + box.boxSize.y));
	var rotationTransform = generateRotationTransform(box.rot);
	for(var i = 0; i < corners.length; i++) {
		corners[i] = applyRotationTransform(corners[i], rotationTransform);
		corners[i].accum(box.pos);
	}
	return corners;
}

function isPointInsideShape(point, shapeCorners) {
	for(var i = 0; i < shapeCorners.length; i++) {
		var corner1 = shapeCorners[i];
		var corner2 = shapeCorners[(i+1)%shapeCorners.length];
		var edge = corner2.subtract(corner1);
		var offsetOfPoint = point.subtract(corner1);
		if(edge.cross(offsetOfPoint) < 0) return false;
	}
	return true;
}

function doRotatableBoxesIntersect(boxA, boxB) {
	var cornersOfBoxA = getRotatableBoxCorners(boxA);
	var cornersOfBoxB = getRotatableBoxCorners(boxB);
	// Check if any of A's corners are in B
	for(var i = 0; i < cornersOfBoxA.length; i++)
		if(isPointInsideShape(cornersOfBoxA[i], cornersOfBoxB)) return true;
	// Check if any of B's corners are in A
	for(var i = 0; i < cornersOfBoxB.length; i++)
		if(isPointInsideShape(cornersOfBoxB[i], cornersOfBoxA)) return true;
	return false;
}
