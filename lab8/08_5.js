"use strict";

const VSHADER_SOURCE =
    '#version 100\n' +
    'precision mediump float;\n' +
    'attribute vec3 a_Position;\n' +
    'attribute vec3 a_Normal;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_LightIntensity;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'uniform vec3 u_Ld;\n' +
    'uniform vec3 u_La;\n' +
    'uniform vec3 u_Kd;\n' +
    'uniform vec3 u_Ka;\n' +
    'uniform mat4 u_MVP;\n' +
    'void main() {\n' +
    ' vec3 tnorm = normalize(a_Normal);\n' +
    ' vec3 s = normalize(u_LightDirection);\n' +
    ' float sDotN = max(dot(s, tnorm), 0.0);\n' +
    ' vec4 diffuse = vec4(u_Kd * u_Ld * sDotN, 1.0) ;\n' +
    ' vec4 ambient = vec4(u_Ka * u_La, 1.0);\n' +
    ' v_LightIntensity = a_Color + diffuse + ambient;\n' +
    ' gl_Position = u_MVP * vec4(a_Position, 1.0);\n' +
    ' gl_PointSize = 10.0;\n' +
    '}\n';

const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_LightIntensity;\n' +
    'void main() {\n' +
    ' gl_FragColor = v_LightIntensity;\n' +
    '}\n';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = glMatrix;

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

    const N = initVertexBuffers(gl);
    if (N < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const u_MVP = gl.getUniformLocation(gl.program, 'u_MVP');
    if (u_MVP < 0) {
        console.log('Failed to get the storage location of u_MVP');
        return -1;
    }

    const u_Ld = gl.getUniformLocation(gl.program, 'u_Ld');
    if (u_Ld < 0) {
        console.log('Failed to get the storage location of u_Ld');
        return -1;
    }

    const u_La = gl.getUniformLocation(gl.program, 'u_La');
    if (u_La < 0) {
        console.log('Failed to get the storage location of u_La');
        return -1;
    }

    const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    if (u_LightDirection < 0) {
        console.log('Failed to get the storage location of u_LightDirection');
        return -1;
    }

    const u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
    if (u_Kd < 0) {
        console.log('Failed to get the storage location of u_Kd');
        return -1;
    }

    const u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
    if (u_Ka < 0) {
        console.log('Failed to get the storage location of u_Ka');
        return -1;
    }

    let ViewMatrix = mat4.create();
    let ProjectionMatrix = mat4.create();
    let MVP = mat4.create();
    let eye = vec3.create();

    vec3.set(eye, 3.0, 3.0, 4.0);
    mat4.perspective(ProjectionMatrix, 60 * Math.PI / 180.0, 1, 1, 10);
    mat4.lookAt(ViewMatrix, eye, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    mat4.multiply(MVP, ProjectionMatrix, ViewMatrix);

    let LightDirection = [-2.0, 1.5, 2.0];
    let Ld = [1.0, 1.0, 1.0];
    let La = [0.2, 0.2, 0.2];
    let Kd = [0.7516, 0.6065, 0.2265];
    let Ka = [0.2473, 0.1995, 0.0745];

    gl.uniform3fv(u_LightDirection, LightDirection);
    gl.uniform3fv(u_Ld, Ld);
    gl.uniform3fv(u_La, La);
    gl.uniform3fv(u_Kd, Kd);
    gl.uniform3fv(u_Ka, Ka);

    gl.uniformMatrix4fv(u_MVP, 0, MVP);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, N, gl.UNSIGNED_SHORT, 0);
}

function initVertexBuffers(gl) {
    const n = 40;
    const m = 40;
    const t = 16.0;
    const r = 2.0;
    let u, v;
    let N = 3 * (n + 1) * (m + 1);
    let vertices = new Float32Array(N);
    u = - Math.PI;

    for (let i = 0; i <= n; i++) {
        v = - Math.PI / 2.0;
        for (let j = 0; j <= m; j++) {
            vertices[3 * (i * (m + 1) + j)] = Math.sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / t) * Math.sign(Math.cos(u)) * Math.pow(Math.abs(Math.cos(u)), 2 / r);
            vertices[3 * (i * (m + 1) + j) + 1] = Math.sign(Math.sin(v)) * Math.pow(Math.abs(Math.sin(v)), 2 / t);
            vertices[3 * (i * (m + 1) + j) + 2] = Math.sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 / t) * Math.sign(Math.sin(u)) * Math.pow(Math.abs(Math.sin(u)), 2 / r);
            v = v + Math.PI / m;
        }
        u = u + 2.0 * Math.PI / n;
    }

    let normals = new Float32Array(N);
    u = - Math.PI;
    for (let i = 0; i <= n; i++) {
        v = - Math.PI / 2.0;
        for (let j = 0; j <= m; j++) {
            normals[3 * (i * (m + 1) + j)] = Math.sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 - 2 / t) * Math.sign(Math.cos(u)) * Math.pow(Math.abs(Math.cos(u)), 2 - 2 / r);
            normals[3 * (i * (m + 1) + j) + 1] = Math.sign(Math.sin(v)) * Math.pow(Math.abs(Math.sin(v)), 2 - 2 / t);
            normals[3 * (i * (m + 1) + j) + 2] = Math.sign(Math.cos(v)) * Math.pow(Math.abs(Math.cos(v)), 2 - 2 / t) * Math.sign(Math.sin(u)) * Math.pow(Math.abs(Math.sin(u)), 2 - 2 / r);
            v = v + Math.PI / m;
        }
        u = u + 2.0 * Math.PI / n;
    }

    let colors = new Float32Array(N);
    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            colors[3 * (i * (m + 1) + j)] = 0.2;
            colors[3 * (i * (m + 1) + j) + 1] = 0.0;
            colors[3 * (i * (m + 1) + j) + 2] = 0.5;
        }
    }

    let indexes = new Uint16Array(6 * n * (m + 1) - 6);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            indexes[6 * (i * (m + 1) + j)] = i * (m + 1) + j;
            indexes[6 * (i * (m + 1) + j) + 1] = i * (m + 1) + j + 1;
            indexes[6 * (i * (m + 1) + j) + 2] = (i + 1) * (m + 1) + j + 1;
            indexes[6 * (i * (m + 1) + j) + 3] = i * (m + 1) + j;
            indexes[6 * (i * (m + 1) + j) + 4] = (i + 1) * (m + 1) + j + 1;
            indexes[6 * (i * (m + 1) + j) + 5] = (i + 1) * (m + 1) + j;
        }
    }

    let FSIZE = vertices.BYTES_PER_ELEMENT;
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 3 * N * FSIZE, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, N * FSIZE, normals);
    gl.bufferSubData(gl.ARRAY_BUFFER, 2 * N * FSIZE, colors);

    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return -1;
    }

    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, FSIZE * N);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, FSIZE * N * 2);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Normal);
    gl.enableVertexAttribArray(a_Color);

    return indexes.length;
}