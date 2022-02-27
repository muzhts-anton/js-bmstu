"use strict";

const VSHADER_SOURCE =
    '#version 100\n' +
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'varying vec4 u_FragColor;\n' +
    'attribute vec4 a_Color;\n' +
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' gl_PointSize = a_PointSize;\n' +
    ' u_FragColor=a_Color;\n' +
    '}\n';
    
const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 u_FragColor;\n' +
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n' +
    '}\n';

function main() {
    const canvas = document.getElementById('webgl');

    const gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');

        return;
    }

    const n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    const n = 3;
    const vertices = new Float32Array(2 * n);
    const Size = new Float32Array(n);
    const Color = new Float32Array(3 * n);

    vertices[0] = 0.5;
    vertices[1] = 0.5;
    vertices[2] = 0.5;
    vertices[3] = -0.5;
    vertices[4] = -0.5;
    vertices[5] = 0.5;
    Size[0] = 10;
    Size[1] = 20;
    Size[2] = 30;
    Color[0] = Math.random();
    Color[1] = Math.random();
    Color[2] = Math.random();
    Color[3] = Math.random();
    Color[4] = Math.random();
    Color[5] = Math.random();
    Color[6] = Math.random();
    Color[7] = Math.random();
    Color[8] = Math.random();

    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {

        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.bufferData(gl.ARRAY_BUFFER, 6 * n * FSIZE, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, 6 * FSIZE, Size);
    gl.bufferSubData(gl.ARRAY_BUFFER, 9 * FSIZE, Color);

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return -1;
    }

    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, FSIZE * 6);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, FSIZE * 9);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_PointSize);
    gl.enableVertexAttribArray(a_Color);

    return n;
}