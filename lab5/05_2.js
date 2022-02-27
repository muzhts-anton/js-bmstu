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
    gl.drawArrays(gl.POINT, 0, n);
}

function initVertexBuffers(gl) {
    const n = 3;
    const VSC = new Float32Array(6 * n);

    VSC[0] = 0.5;
    VSC[1] = 0.5;
    VSC[2] = 0.5;
    VSC[3] = -0.5;
    VSC[4] = -0.5;
    VSC[5] = 0.5;
    VSC[6] = Math.random();
    VSC[7] = Math.random();
    VSC[8] = Math.random();
    VSC[9] = Math.random();
    VSC[10] = Math.random();
    VSC[11] = Math.random();
    VSC[12] = Math.random();
    VSC[13] = Math.random();
    VSC[14] = Math.random();
    VSC[15] = 10;
    VSC[16] = 20;
    VSC[17] = 30;

    const VSC_Buffer = gl.createBuffer();
    if (!VSC_Buffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, VSC_Buffer);
    var FSIZE = VSC.BYTES_PER_ELEMENT;
    gl.bufferData(gl.ARRAY_BUFFER, VSC, gl.STATIC_DRAW);

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
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, FSIZE * 6);
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, FSIZE * 15);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}