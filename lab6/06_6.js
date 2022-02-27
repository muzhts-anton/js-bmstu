"use strict";

const { mat2, mat3, mat4, vec2, vec3, vec4 } = glMatrix;
// Vertex shader program
const VSHADER_SOURCE =
    '#version 100\n' +
    'attribute vec4 a_Position;\n' +
    'uniform mat4 locat;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 b_Color;\n' +
    'void main() {\n' +
    '  gl_Position = locat*a_Position;\n' +
    '  b_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 b_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = b_Color;\n' +
    '}\n';

function main() {
    // Retrieve <canvas> element
    const canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    const gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Write the positions of vertices to a vertex shader
    const n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(1, 1, 1, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttrib3f(a_Color, 255, 0, 255);

    const matArray = gl.getUniformLocation(gl.program, 'locat');
    // Единичная матрица
    const rotationMatrix = mat4.create();
    gl.uniformMatrix4fv(matArray, 0, rotationMatrix);

    let i = 0;
    let lastUpdate = null;
    const func = (t) => {
        if (!lastUpdate || t - lastUpdate >= 1000 / 45) {
            mat4.fromTranslation(rotationMatrix, vec3.fromValues(0, 0, 0));
            mat4.rotateZ(rotationMatrix, rotationMatrix, i * Math.PI / 180);
            gl.uniformMatrix4fv(matArray, 0, rotationMatrix);
            gl.drawArrays(gl.LINES, 0, n);
            i++;
            lastUpdate = t;
        }
        requestAnimationFrame(func);
    };
    requestAnimationFrame(func);
}

function initVertexBuffers(gl) {
    const n = 6; // The number of vertices

    const vertices = new Float32Array([0.0, 0.2, -0.2, -0.2,
        -0.2, -0.2, 0.2, -0.2,
        0.0, 0.2, 0.2, -0.2]);

    // Create a buffer object
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}
