if( ! window.requestAnimationFrame ) {
  window.requestAnimationFrame = ( function() {

    return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( callback, element ) {
              window.setTimeout( callback, 1000 / 60 );
            };
  } )();
}

$(document).ready(
  function() {
      var canvas = document.getElementById("myCanvas");
      var gl = initWebGL(canvas);

      //var square = createSquare(gl);
      var cube = createCube(gl);

      initMatrices(canvas);
      initShader(gl);

      //draw(gl, cube);
      run(gl, cube);
  }
);

function initWebGL(canvas) {
  var gl = null;
  var msg = "Your browser does not support WebGL, " +
      "or it is not enabled by default.";
  try
  {
      gl = canvas.getContext("experimental-webgl");
      gl.viewport(0, 0, canvas.width, canvas.height);
  }
  catch (e) {
      msg = "Error creating WebGL Context!: " + e.toString();
  }

  if (!gl) {
    //alert(msg);
    throw new Error(msg);
  }
  return gl;
}

function draw(gl, obj) {
   // clear the background (with black)
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // set the vertex buffer to be drawn
   gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

   // set the shader to use
   gl.useProgram(shaderProgram);

   // connect up the shader parameters: vertex position
   // and projection/model matrices
   gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
   gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);


   gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
   gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
   // draw the object
   gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
}

var duration = 5000; // ms
var currentTime = Date.now();
function animate() {
  var now = Date.now();
  var deltat = now - currentTime;
  currentTime = now;
  var fract = deltat / duration;
  var angle = Math.PI * 2 * fract;
  mat4.rotate(modelViewMatrix, modelViewMatrix, angle, [1.0, 1.0, 1.0]);
}

function run(gl, cube) {
  requestAnimationFrame(function() { run(gl, cube); });
  draw(gl, cube);
  animate();
}

// function createSquare(gl) {
//     var vertexBuffer;
//     vertexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//     var verts = [
//          .5,  .5,  0.0,
//         -.5,  .5,  0.0,
//          .5, -.5,  0.0,
//         -.5, -.5,  0.0
//     ];
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
//     var square = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};
//     return square;
// }

// Create the vertex, color, and index data for a multicolored cube
function createCube(gl) {
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
     // Front face
     -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
     -1.0,  1.0,  1.0,
     // Back face
     -1.0, -1.0, -1.0,
     -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,
     // Top face
     -1.0,  1.0, -1.0,
     -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
     // Bottom face
     -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
     -1.0, -1.0,  1.0,
     // Right face
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
     // Left face
     -1.0, -1.0, -1.0,
     -1.0, -1.0,  1.0,
     -1.0,  1.0,  1.0,
     -1.0,  1.0, -1.0
     ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [0.0, 0.0, 0.0, 0.5], // Front face
      [0.0, 0.0, 0.0, 0.4], // Back face
      [0.0, 0.0, 0.0, 0.3], // Top face
      [0.0, 0.0, 0.0, 0.2], // Bottom face
      [0.0, 0.0, 0.0, 0.1], // Right face
      [0.0, 0.0, 0.0, 0.0]  // Left face
  ];
  var vertexColors = [];
  for (var i in faceColors) {
      var color = faceColors[i];
      for (var j=0; j < 4; j++) {
          vertexColors = vertexColors.concat(color);
      }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors),gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn)
  var cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  var cubeIndices = [
      0, 1, 2, 0, 2, 3,    // Front face
      4, 5, 6, 4, 6, 7,    // Back face
      8, 9, 10, 8, 10, 11,  // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23  // Left face
    ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
  var cube = {buffer:vertexBuffer, colorBuffer:colorBuffer,
          indices:cubeIndexBuffer,
              vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
              primtype:gl.TRIANGLES};
  return cube;
}

var projectionMatrix, modelViewMatrix;
var rotationAxis;

function initMatrices(canvas)
{
  // Create a model view matrix with camera at 0, 0, −3.333
  modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -8]);

  // Create a project matrix with 45 degree field of view
  projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);

  rotationAxis = vec3.create();
  vec3.normalize(rotationAxis, [1, 1, 1]);
}

function createShader(gl, str, type) {
      var shader;
      if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
          return null;
      }

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
  }
  return shader;
}

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
        shaderProjectionMatrixUniform,
        shaderModelViewMatrixUniform;

function initShader(gl) {
  var vertexShaderSource =
      "attribute vec3 vertexPos;" +
      "attribute vec4 vertexColor;" +
      "uniform mat4 modelViewMatrix;" +
      "uniform mat4 projectionMatrix;" +
      "varying vec4 vColor;" +
      "void main(void) {" +
      "    	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);" +
      "		vColor = vertexColor;" +
      "}";
  var fragmentShaderSource =
      "    precision mediump float;" +
      "    varying vec4 vColor;" +
        "void main(void) {" +
        "    gl_FragColor = vColor;" +
        "}";

  // load and compile the fragment and vertex shader
  var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
  var vertexShader = createShader(gl, vertexShaderSource, "vertex");

  // link them together into a new program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // get pointers to the shader params
  shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
  shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");

  gl.enableVertexAttribArray(shaderVertexPositionAttribute);
  gl.enableVertexAttribArray(shaderVertexColorAttribute);

  shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
  shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

  if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }
}
