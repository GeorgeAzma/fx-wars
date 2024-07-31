import { HANDS } from "./settings.js"

export default class Shader {
    frag = '';
  
    canvas = null;
    texture = null;
    video = null;
    brightness = 1.0;
    points = new Float32Array(21 * HANDS * 3).fill(-1.0);
    program = null;
    gl = null;
    vs = null;
    start = performance.now();
  
    constructor(canvas, video, frag) {
      this.canvas = canvas;
      this.video = video;
      this.frag = frag;
      this.gl = this.canvas.getContext('webgl2', { willReadFrequently: true });
      this.texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      if (!this.gl) {
        console.error('WebGL is not supported in this browser.');
        return;
      }
      this.start = performance.now();
  
      this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
      if (!this.vs) {
        alert('Could not create vertex shader');
        return;
      }
      this.gl.shaderSource(this.vs, `#version 300 es 
      precision mediump float;
      void main() {
        vec2 vertices[3]=vec2[3](vec2(-1,-1), vec2(3,-1), vec2(-1, 3));
        gl_Position = vec4(vertices[gl_VertexID],0,1);
      }`);
      this.gl.compileShader(this.vs);
      if (!this.gl.getShaderParameter(this.vs, this.gl.COMPILE_STATUS)) {
        const errorLog = this.gl.getShaderInfoLog(this.vs);
        console.error('Vertex shader compilation error:', errorLog);
      }
  
      this.onShaderChange(this.frag);
    }
  
    resizeCanvas() {
      if (!this.canvas) {
        return;
      }
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      if (this.gl && this.program) {
        this.gl.useProgram(this.program);
        const res = this.gl.getUniformLocation(this.program, 'resolution');
        this.gl.uniform2f(res, this.canvas.width, this.canvas.height);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  
    async onShaderChange(frag) {
      this.frag = frag;
      if (!this.frag) this.frag = `#version 300 es 
      precision mediump float;
      out vec4 color;
      void main() {
      color = vec4(1, 0, 1, 1);
      }`;
      else {
        this.frag = frag;
        if (this.frag.endsWith(".frag")) {
          let r = await fetch(this.frag);
          let t = await r.text();
          this.frag = t;
        }
      }
      if (!this.gl) return;
  
      const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      if (!fs) {
        alert('Could not create fragment shader');
        return;
      }
      this.gl.shaderSource(fs, this.frag);
      this.gl.compileShader(fs);
      if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
        const errorLog = this.gl.getShaderInfoLog(fs);
        console.error('Fragment shader compilation error:', errorLog);
      }
  
      if (this.program) {
        this.gl.deleteProgram(this.program);
        this.program = null;
      }
      this.program = this.gl.createProgram();
      if (!this.program) {
        alert('Could not create shader program');
        return;
      }
      this.gl.attachShader(this.program, fs);
      this.gl.attachShader(this.program, this.vs);
      this.gl.linkProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        const errorLog = this.gl.getProgramInfoLog(this.program);
        console.error('Program link error:', errorLog);
      }
      this.gl.deleteShader(fs);
  
      this.resizeCanvas();
  
      this.render();
    }
  
    render() {
      if (!(this.canvas && this.gl && this.program && this.video)) return;
      this.gl.useProgram(this.program);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.video);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      const time = this.gl.getUniformLocation(this.program, 'time');
      if (time) this.gl.uniform1f(time, (performance.now() - this.start) / 1000);
      const points = this.gl.getUniformLocation(this.program, 'points');
      if (points) this.gl.uniform3fv(points, this.points);
      const brightness = this.gl.getUniformLocation(this.program, 'brightness');
      if (brightness) this.gl.uniform1f(brightness, this.brightness);
    }
  }