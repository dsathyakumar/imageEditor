
//> basic set up Initialization - canvas, buttons, coordinates, pixelData, rubberbandDiv, isMouseDown, history
var canvas = document.getElementById('canvas'),
    tempCanvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    tempCanvasContext = tempCanvas.getContext('2d'),
    rubberbandDiv = document.getElementById('rubberbandDiv'),
    resetButton = document.getElementById('resetButton'),
    increaseBrightness = document.getElementById('ib'),
    decreaseBrightness = document.getElementById('db'),
    increaseContrast = document.getElementById('ic'),
    decreaseContrast = document.getElementById('dc'),
    rotateleft = document.getElementById('rl'),
    rotateright = document.getElementById('rr'),
    zoomin = document.getElementById('zi'),
    zoomout = document.getElementById('zo'),
    body = document.getElementById('body_1'), // not used for now
    image = new Image(),
    mousedown = {},
    rubberbandRectangle = {},
    dragging = false,
    centerShiftX,
    centerShiftY,
    originalPixelData, // not used for now
    ratio,
    isMouseDown = false,
    editorHistory = {};

//> our temp canvas set up
tempCanvas.setAttribute('width','800');
tempCanvas.setAttribute('height', '520');

//> function to zoom in
function zoomPlus(){
  //> get the scale
  var scale = parseFloat(zoomin.getAttribute('data-step'));
  //> get the currentvalue
  var currentvalue = parseFloat(zoomin.getAttribute('data-currentvalue'));
  //> get the maxVal
  var maxVal = parseFloat(zoomin.getAttribute('data-max'));
  //> compute the latest delta
  var delta = scale + currentvalue;
  if(delta < maxVal){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    zoomin.setAttribute('data-currentvalue', delta);
    zoomout.setAttribute('data-currentvalue', delta);
    context.scale(scale, scale);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
  }
}

//> function to zoom out
function zoomMinus(){
  //> get the scale which is always less than 1 but a positive value
  var scale = parseFloat(zoomout.getAttribute('data-step'));
  //> get the currentvalue - starts with zero initially
  var currentvalue = parseFloat(zoomout.getAttribute('data-currentvalue'));
  //> get the minVal - which will be some deep -ve value
  var minVal = parseFloat(zoomout.getAttribute('data-min'));
  //> compute the latest delta - so since we do -(scale), we always end up with a negative value when zoomed out
  var delta = -scale + currentvalue;
  if(delta > minVal){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    zoomin.setAttribute('data-currentvalue', delta);
    zoomout.setAttribute('data-currentvalue', delta);
    context.scale(scale, scale);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
  }
}

/*function zoomonscroll(e){
  e.preventDefault();
  var scale = 1;
  var zoomIntensity = 0.2;
  var originx = 0;
  var originy = 0;

  var mousex = e.clientX - canvas.offsetLeft;
  var mousey = e.clientY - canvas.offsetTop;
  var wheel = e.wheelDelta/120;//n or -n
  var zoom = Math.exp(wheel*zoomIntensity);

  context.translate(originx, originy);

  originx -= mousex/(scale*zoom) - mousex/scale;
  originy -= mousey/(scale*zoom) - mousey/scale;

  context.scale(zoom,zoom);

  context.translate(-originx, -originy);

  scale *= zoom;
}*/

//> function that deals with incrasing contrast
function contrastUp(){
  var step = parseInt(increaseContrast.getAttribute('data-step'));
  var currentvalue = parseInt(increaseContrast.getAttribute('data-currentvalue'));
  var delta = (step) + (currentvalue);
  var maxVal = parseInt(increaseContrast.getAttribute('data-max'));

  if(delta < maxVal){
    tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCanvasContext.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
    var pixels = tempCanvasContext.getImageData(0, 0, tempCanvas.width,tempCanvas.height);
    var pixelDataArray = pixels.data;
    decreaseContrast.setAttribute('data-currentvalue',delta);
    increaseContrast.setAttribute('data-currentvalue',delta);
    editorHistory['contrast'] = delta;
    console.log('Beginning increaseContrast...');
    delta = Math.floor(255 * (delta / 100));
    for (var i = 0; i < pixelDataArray.length; i += 4) {
      var brightness = (pixelDataArray[i]+pixelDataArray[i+1]+pixelDataArray[i+2])/3; //get the brightness
      pixelDataArray[i] += (brightness > 127) ? delta : -delta; // red
      pixelDataArray[i + 1] += (brightness > 127) ? delta : -delta; // green
      pixelDataArray[i + 2] += (brightness > 127) ? delta : -delta; // blue
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(pixels, 0, 0);
    console.log('complete increaseContrast...');
  }
}

//> function that deals with contrast reduction
function contrastDown(){
  var step = parseInt(decreaseContrast.getAttribute('data-step'));
  var currentvalue = parseInt(decreaseContrast.getAttribute('data-currentvalue'));
  var delta = (step) + (currentvalue);
  var minVal = parseInt(decreaseContrast.getAttribute('data-min'));

  if(delta > minVal){
    tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCanvasContext.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
    var pixels = tempCanvasContext.getImageData(0, 0, tempCanvas.width,tempCanvas.height);
    var pixelDataArray = pixels.data;
    decreaseContrast.setAttribute('data-currentvalue',delta);
    increaseContrast.setAttribute('data-currentvalue',delta);
    editorHistory['contrast'] = delta;
    console.log('Beginning decreaseContrast...');
    delta = Math.floor(255 * (delta / 100));
    for (var i = 0; i < pixelDataArray.length; i += 4) {
      var brightness = (pixelDataArray[i]+pixelDataArray[i+1]+pixelDataArray[i+2])/3; //get the brightness
      pixelDataArray[i] += (brightness > 127) ? delta : -delta; // red
      pixelDataArray[i + 1] += (brightness > 127) ? delta : -delta; // green
      pixelDataArray[i + 2] += (brightness > 127) ? delta : -delta; // blue
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(pixels, 0, 0);
    console.log('complete decreaseContrast...');
  }
}

//> rotate anti clockwise
function rotateAntiClockWise(){
  var angle = parseInt(rotateleft.getAttribute('data-step'));
  var currentvalue = parseInt(rotateleft.getAttribute('data-currentvalue'));
  var delta = angle + currentvalue;

  if(delta >= -359){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    rotateleft.setAttribute('data-currentvalue', delta);
    rotateright.setAttribute('data-currentvalue', delta);
    context.rotate(angle * Math.PI / 180);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
  }
}

//> rotate clockwise
function rotateClockWise(){
  var angle = parseInt(rotateright.getAttribute('data-step'));
  var currentvalue = parseInt(rotateright.getAttribute('data-currentvalue'));
  var delta = angle + currentvalue;

  if(delta < 360){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    rotateleft.setAttribute('data-currentvalue', delta);
    rotateright.setAttribute('data-currentvalue', delta);
    context.rotate(angle * Math.PI / 180);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
  }
}

//> function to increase brightness
function brightnessPlus(){
  var step = parseInt(increaseBrightness.getAttribute('data-step'));
  var currentvalue = parseInt(increaseBrightness.getAttribute('data-currentvalue'));
  var delta = (step) + (currentvalue);
  var maxVal = parseInt(increaseBrightness.getAttribute('data-max'));

  if(delta < maxVal){
    tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCanvasContext.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
    var pixels = tempCanvasContext.getImageData(0, 0, tempCanvas.width,tempCanvas.height);
    var pixelDataArray = pixels.data;
    decreaseBrightness.setAttribute('data-currentvalue',delta);
    increaseBrightness.setAttribute('data-currentvalue',delta);
    editorHistory['brightness'] = delta;
    console.log('Beginning increaseBrightness...');
    delta = Math.floor(255 * (delta / 100));
    for (var i = 0; i < pixelDataArray.length; i += 4) {
      pixelDataArray[i] = pixelDataArray[i] + delta; // red
      pixelDataArray[i + 1] += delta; // green
      pixelDataArray[i + 2] += delta; // blue
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(pixels, 0, 0);
    console.log('complete increaseBrightness...');
  }
}

//> function to decrease brightness
function brightnessMinus(){
  var step = parseInt(decreaseBrightness.getAttribute('data-step'));
  var currentvalue = parseInt(decreaseBrightness.getAttribute('data-currentvalue'));
  var delta = step + currentvalue;
  var minVal = parseInt(decreaseBrightness.getAttribute('data-min'));

  if(delta > minVal){
    tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCanvasContext.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
    var pixels = tempCanvasContext.getImageData(0, 0, tempCanvas.width,tempCanvas.height);
    var pixelDataArray = pixels.data;
    increaseBrightness.setAttribute('data-currentvalue',delta);
    decreaseBrightness.setAttribute('data-currentvalue',delta);
    editorHistory['brightness'] = delta;
    console.log('Beginning decreaseBrightness...');
    delta = Math.floor(255 * (delta / 100));
    for (var i = 0; i < pixelDataArray.length; i += 4) {
      pixelDataArray[i] = pixelDataArray[i] + delta; // red
      pixelDataArray[i + 1] += delta; // green
      pixelDataArray[i + 2] += delta; // blue
    }
    context.putImageData(pixels, 0, 0);
    console.log('complete decreaseBrightness...');
  }
}

//> Functions for CROP ----- START

//> this is executed on mouse down
function rubberbandStart(x, y) {

 //> get the coordinates at which the DIV was clicked

 //> setting the mousedown object
 mousedown.x = x;
 mousedown.y = y;

 //>setting the rubberbandRectangle object
 rubberbandRectangle.left = mousedown.x;
 rubberbandRectangle.top = mousedown.y;

 //> move the rubbber band DIV to that point
 moveRubberbandDiv();
 //> show the div
 showRubberbandDiv();

 //> the element is clicked so it is assumed to be dragged.
 //dragging = true;
}

//> this is executed on mousemove
function rubberbandStretch(x, y) {
  var canvasCoordinates = canvas.getBoundingClientRect();
 //> we are trying to set the left point again
 //> if mousedrag X is less that the point where mouse down was done, choose the mousedrag X, else choose mousedown x
 //> set it on the rubberbandRectangle object
 rubberbandRectangle.left = (x < mousedown.x) ? x : mousedown.x;
 rubberbandRectangle.top  = (y < mousedown.y) ? y : mousedown.y;

 //> set the width and height in the rubberbandRectangle object
 rubberbandRectangle.width  = Math.abs(x - mousedown.x),
 rubberbandRectangle.height = Math.abs(y - mousedown.y);

 var isXinRange = rubberbandRectangle.left > canvasCoordinates.left && x < canvasCoordinates.right;
 var isYinRange = rubberbandRectangle.top > canvasCoordinates.top && y < canvasCoordinates.bottom;
 if(isXinRange && isYinRange){
   moveRubberbandDiv();
   resizeRubberbandDiv();
 }
}

//> This is executed on mouseup
function rubberbandEnd() {
  if(dragging){
    var bbox = canvas.getBoundingClientRect();

    try {
       tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
       tempCanvasContext.drawImage(canvas,
           rubberbandRectangle.left - bbox.left,
           rubberbandRectangle.top - bbox.top,
           rubberbandRectangle.width,
           rubberbandRectangle.height,
           centerShiftX, centerShiftY, rubberbandRectangle.width * ratio, rubberbandRectangle.height * ratio);
       var imageData = tempCanvasContext.getImageData(0,0,tempCanvas.width,tempCanvas.height);
       context.clearRect(0, 0, canvas.width, canvas.height);
       context.putImageData(imageData, 0, 0);
       tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    catch (e) {
      console.log(e);
       // Suppress error message when mouse is released
       // outside the canvas
    }

    //> reset the rubberband rectangle object
    resetRubberbandRectangle();

    //> reset the height and width
    rubberbandDiv.style.width = 0;
    rubberbandDiv.style.height = 0;

    //> hide the rubber band div again
    hideRubberbandDiv();

    //> end of dragging
    dragging = false;
  }
}

//> move the rubberbandDiv to that position - so set the style values
function moveRubberbandDiv() {
  rubberbandDiv.style.top  = rubberbandRectangle.top  + 'px';
  rubberbandDiv.style.left = rubberbandRectangle.left + 'px';
}

//> set the new height and width & prevent rubberband from exceeding canvas width & height
function resizeRubberbandDiv() {
  rubberbandDiv.style.width  = rubberbandRectangle.width  + 'px';
  rubberbandDiv.style.height = rubberbandRectangle.height + 'px';
}

//> show the rubber band DIV
function showRubberbandDiv() {
  rubberbandDiv.style.display = 'inline';
}

//> hide the rubbber band DIV
function hideRubberbandDiv() {
  rubberbandDiv.style.display = 'none';
}

//> once the operation is done. Reset the rubberbandDiv
function resetRubberbandRectangle() {
  rubberbandRectangle = { top: 0, left: 0, width: 0, height: 0 };
}

//> Functions for CROP ----- END

function calculateRotation(degree){
  var actual = 0;
  if (degree >= 0){
    if(value >=0 && value <= 359){
      actual = degree;
    }else {
      actual = degree - 360;
    }
  }else{
    if(degree >= -360){
      actual = degree + 360;
    }else{
      actual = 2(360) + degree;
    }
  }
  return actual;
}

//> Event handlers for brightness, contrast, rotate, zoom

increaseContrast.addEventListener('click', contrastUp);

decreaseContrast.addEventListener('click', contrastDown);

rotateleft.addEventListener('click', rotateAntiClockWise);

rotateright.addEventListener('click', rotateClockWise);

increaseBrightness.addEventListener('click', brightnessPlus);

decreaseBrightness.addEventListener('click', brightnessMinus);

zoomin.addEventListener('click', zoomPlus);

zoomout.addEventListener('click', zoomMinus);

//canvas.addEventListener('mousewheel', zoomonscroll);

//> what is to be done when mousedown occurs on canvas
canvas.onmousedown = function (e) {
  isMouseDown = true;
  var x = e.clientX,
      y = e.clientY;

  e.preventDefault();
  rubberbandStart(x, y);
};

//> what is to be done when mouse moves on canvas
canvas.onmousemove = function (e) {
  //> check if mouse is down while its moving
  if(isMouseDown){
    dragging = true;
    var x = e.clientX,
        y = e.clientY;

     e.preventDefault();
     if (dragging) {
        rubberbandStretch(x, y);
     }
   }
};

//> execute rule on mouse up
window.onmouseup = function (e) {
  isMouseDown = false;
  e.preventDefault();
  rubberbandEnd();
};

//> once the image has loaded - draw the image - this is the 1st of many draws
image.onload = function () {
  var wRatio = canvas.width/image.width;
  var hRatio = canvas.height/image.height;
  ratio = Math.min(hRatio, wRatio);
  centerShiftX = (canvas.width - image.width * ratio) / 2;
  centerShiftY = (canvas.height - image.height * ratio) / 2;
  context.save();
  var pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  originalPixelData = [];
  for (var i = 0; i < pixelData.length; i = i + 1) {
      var pixel = pixelData[i];
      originalPixelData[i] = pixel;
  }
  context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
};

//> click on reset button
resetButton.onclick = function(e) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);
};

//> Initialization of the image

image.src = 'assets/img/scenery.jpg';
