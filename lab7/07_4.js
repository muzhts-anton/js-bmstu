"use strict";

const VSHADER_SOURCE =
    '#version 100\n' +
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'varying vec4 v_FragColor;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MVP;\n' +
    'void main() {\n' +
    ' gl_Position = u_MVP * a_Position;\n' +
    ' gl_PointSize = 10.0;\n' +
    ' v_FragColor = a_Color;\n' +
    '}\n';

const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_FragColor;\n' +
    'void main() {\n' +
    ' gl_FragColor = v_FragColor;\n' +
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

    const n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    const controls = {
        view: 'axonometry'
    };

    const gui = new dat.GUI();
    const guiCamera = gui.addFolder('camera');
    let projectionMatrix = mat4.create();

    const projection = {
        perspective: "Orthographic",
        switchCamera: function () {
            if (this.perspective == "Perspective") {
                mat4.ortho(projectionMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 3.0);
                //mat4.ortho(projectionMatrix, -5.0, 5.0, -5.0, 5.0, 0.0, 3.0);
                //mat4.ortho(projectionMatrix, -0.6, 0.6, -0.6, 0.6, 0.0, 3.0);
                this.perspective = "Orthographic";
                guiCamera.remove(view);
                controls.view = 'axonometry';
                view = guiCamera.add(controls, 'view', ['left', 'right', 'top', 'bottom', 'front', 'back', 'isometry', 'axonometry']).onChange(function (e) {
                    console.log(e);
                    controls.view = e;
                });
            } else {
                //mat4.frustum(projectionMatrix, -1, 1.3, -1.3, 1, 1, 6);
                //mat4.perspective(projectionMatrix, 60 * Math.PI / 180.0, 1 , 1, 6);
                mat4.perspective(projectionMatrix, 135 * Math.PI / 180.0, 1 , 0.1, 6)
                //mat4.perspective(projectionMatrix, 20 * Math.PI / 180.0, 1, 1, 12)

                this.perspective = "Perspective";
                guiCamera.remove(view);
                controls.view = '3-point';
                view = guiCamera.add(controls, 'view', ['1-point', '2-point', '3-point']).onChange(function (e) {
                    console.log(e);
                    controls.view = e;
                });
            }
        }
    };

    guiCamera.add(projection, 'switchCamera');
    guiCamera.add(projection, 'perspective').listen();
    let view = guiCamera.add(controls, 'view', ['left', 'right', 'top', 'bottom', 'front', 'back', 'isometry', 'axonometry']).onChange(function (e) {
        console.log(e);
        controls.view = e;
    });

    let eye = vec3.create();
    let up = vec3.create();
    function render() {
        switch (controls.view) {
            case 'left':
                vec3.set(eye, -0.5, 0.0, 0.0); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case 'right':
                vec3.set(eye, 0.5, 0.0, 0.0); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case 'top':
                vec3.set(eye, 0.0, 0.5, 0.0); vec3.set(up, 0.0, 0.0, -1.0)
                break;
            case 'bottom':
                vec3.set(eye, 0.0, -0.5, 0.0); vec3.set(up, 0.0, 0.0, 1.0)
                break;
            case 'front':
                vec3.set(eye, 0.0, 0.0, 0.5); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case 'back':
                vec3.set(eye, 0.0, 0.0, -0.5); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case 'isometry':
                vec3.set(eye, 0.5, 0.5, 0.5); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case 'axonometry':
                vec3.set(eye, 0.5, 0.7, 0.9); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case '1-point':
                //vec3.set(eye, 0.0, 0.0, 1.5); vec3.set(up, 0.0, 1.0, 0.0)
                vec3.set(eye, 0.0, 0.0, 0.9); vec3.set(up, 0.0, 1.0, 0.0)
                //vec3.set(eye, 0.0, 0.0, 8.5); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case '2-point':
                //vec3.set(eye, 1.2, 0.0, 1.2); vec3.set(up, 0.0, 1.0, 0.0)
                //vec3.set(eye, 0.6, 0.0, 0.6); vec3.set(up, 0.0, 1.0, 0.0)
                vec3.set(eye, 6.0, 0.0, 6.0); vec3.set(up, 0.0, 1.0, 0.0)
                break;
            case '3-point':
                //vec3.set(eye, 1.0, 1.0, 1.0); vec3.set(up, 0.0, 1.0, 0.0)
                //vec3.set(eye, 0.5, 0.5, 0.5); vec3.set(up, 0.0, 1.0, 0.0)
                vec3.set(eye, 5.0, 5.0, 5.0); vec3.set(up, 0.0, 1.0, 0.0)
                break;
        }

        const u_MVP = gl.getUniformLocation(gl.program, 'u_MVP');
        if (u_MVP < 0) {
            console.log('Failed to get the storage location of u_MVP');
            return -1;
        }

        let MVP_Matrix = mat4.create();
        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, eye, [0.0, 0.0, 0.0], up);
        mat4.multiply(MVP_Matrix, projectionMatrix, viewMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(u_MVP, 0, MVP_Matrix);
        gl.drawArrays(gl.LINES, 0, n);
        requestAnimationFrame(render);
    }
    render();
}

function initVertexBuffers(gl) {
    const vertices = new Float32Array([
        0.4, 0.4, 0.4,
        -0.4, 0.4, 0.4,
        -0.4, 0.4, 0.4,
        -0.4, -0.4, 0.4,
        -0.4, -0.4, 0.4,
        0.4, -0.4, 0.4,
        0.4, -0.4, 0.4,
        0.4, 0.4, 0.4,
        0.4, 0.4, 0.4,
        0.4, 0.4, -0.4,
        -0.4, 0.4, 0.4,
        -0.4, 0.4, -0.4,
        -0.4, -0.4, 0.4,
        -0.4, -0.4, -0.4,
        0.4, -0.4, 0.4,
        0.4, -0.4, -0.4,
        0.4, 0.4, -0.4,
        -0.4, 0.4, -0.4,
        -0.4, 0.4, -0.4,
        -0.4, -0.4, -0.4,
        -0.4, -0.4, -0.4,
        0.4, -0.4, -0.4,
        0.4, -0.4, -0.4,
        0.4, 0.4, -0.4,]);

    const Color = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ]);

    const n = vertices.length;
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.bufferData(gl.ARRAY_BUFFER, 6 * n * FSIZE, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, 3 * n * FSIZE, Color);

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, FSIZE * 3 * n);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    return n;
}