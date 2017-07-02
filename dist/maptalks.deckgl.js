/*!
 * maptalks.deckgl v0.0.0
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
/*!
 * requires maptalks@^0.25.1 
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks'), require('deck.gl')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks', 'deck.gl'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks,global.deck_gl));
}(this, (function (exports,maptalks,deck_gl) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var options = {
    'renderer': 'webgl',
    'doubleBuffer': true,
    'glOptions': null
};

var RADIAN = Math.PI / 180;

/**
 * A Layer to render with THREE.JS (http://threejs.org), the most popular library for WebGL. <br>
 *
 * @classdesc
 * A layer to render with THREE.JS
 * @example
 *  var layer = new maptalks.ThreeLayer('three');
 *
 *  layer.prepareToDraw = function (gl, scene, camera) {
 *      var size = map.getSize();
 *      return [size.width, size.height]
 *  };
 *
 *  layer.draw = function (gl, scene, camera, width, height) {
 *      //...
 *  };
 *  layer.addTo(map);
 * @class
 * @category layer
 * @extends {maptalks.CanvasLayer}
 * @param {String|Number} id - layer's id
 * @param {Object} options - options defined in [options]{@link maptalks.ThreeLayer#options}
 */
var DeckGLLayer = function (_maptalks$CanvasLayer) {
    _inherits(DeckGLLayer, _maptalks$CanvasLayer);

    function DeckGLLayer() {
        _classCallCheck(this, DeckGLLayer);

        return _possibleConstructorReturn(this, _maptalks$CanvasLayer.apply(this, arguments));
    }

    return DeckGLLayer;
}(maptalks.CanvasLayer);

DeckGLLayer.mergeOptions(options);

var DeckGLRenderer = function (_maptalks$renderer$Ca) {
    _inherits(DeckGLRenderer, _maptalks$renderer$Ca);

    function DeckGLRenderer() {
        _classCallCheck(this, DeckGLRenderer);

        return _possibleConstructorReturn(this, _maptalks$renderer$Ca.apply(this, arguments));
    }

    DeckGLRenderer.prototype.draw = function draw() {
        _maptalks$renderer$Ca.prototype.draw.call(this);
        this.renderScene();
    };

    DeckGLRenderer.prototype.drawOnInteracting = function drawOnInteracting() {
        _maptalks$renderer$Ca.prototype.drawOnInteracting.call(this);
        this.renderScene();
    };

    DeckGLRenderer.prototype.getPrepareParams = function getPrepareParams() {
        return [this.layerManager];
    };

    DeckGLRenderer.prototype.getDrawParams = function getDrawParams() {
        return [this.layerManager];
    };

    DeckGLRenderer.prototype.createCanvas = function createCanvas() {
        if (this.canvas) {
            return;
        }

        var map = this.getMap();
        var size = map.getSize();
        var r = maptalks.Browser.retina ? 2 : 1;
        this.canvas = maptalks.Canvas.createCanvas(r * size['width'], r * size['height'], map.CanvasClass);
        var gl = this.gl = this._createGLContext(this.canvas, this.layer.options['glOptions']);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        if (this.onCanvasCreate) {
            this.onCanvasCreate();
        }

        if (this.layer.options['doubleBuffer']) {
            this.buffer = maptalks.Canvas.createCanvas(this.canvas.width, this.canvas.height, map.CanvasClass);
            this.context = this.buffer.getContext('2d');
        }
    };

    DeckGLRenderer.prototype.resizeCanvas = function resizeCanvas(canvasSize) {
        if (!this.canvas) {
            return;
        }
        var size = void 0;
        if (!canvasSize) {
            size = this.getMap().getSize();
        } else {
            size = canvasSize;
        }
        var r = maptalks.Browser.retina ? 2 : 1;
        //retina support
        this.canvas.height = r * size['height'];
        this.canvas.width = r * size['width'];
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };

    DeckGLRenderer.prototype.clearCanvas = function clearCanvas() {
        if (!this.canvas) {
            return;
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    };

    DeckGLRenderer.prototype.prepareCanvas = function prepareCanvas() {
        if (this.context) {
            // the layer is double buffered, clip the canvas with layer's mask.
            return _maptalks$renderer$Ca.prototype.prepareCanvas.call(this);
        }
        if (!this.canvas) {
            this.createCanvas();
        } else {
            this.clearCanvas();
        }
        this.layer.fire('renderstart', { 'context': this.context, 'gl': this.gl });
        return null;
    };

    DeckGLRenderer.prototype.getTargetZoom = function getTargetZoom(map) {
        return map.getMaxNativeZoom() / 2;
    };

    DeckGLRenderer.prototype._getLookAtMat = function _getLookAtMat() {
        var map = this.getMap();

        var targetZ = this.getTargetZoom(map);

        var size = map.getSize(),
            scale = map.getScale() / map.getScale(targetZ);
        // const center = this.cameraCenter = map._prjToPoint(map._getPrjCenter(), map.getMaxNativeZoom());
        var center2D = this.cameraCenter = map.coordinateToPoint(map.getCenter(), targetZ);
        var pitch = map.getPitch() * RADIAN;
        var bearing = -map.getBearing() * RADIAN;

        var ratio = this._getFovRatio();
        var z = scale * size.height / 2 / ratio;
        var cz = z * Math.cos(pitch);
        // and [dist] away from map's center on XY plane to tilt the scene.
        var dist = Math.sin(pitch) * z;
        // when map rotates, the camera's xy position is rotating with the given bearing and still keeps [dist] away from map's center
        var cx = center2D.x + dist * Math.sin(bearing);
        var cy = center2D.y + dist * Math.cos(bearing);

        // when map rotates, camera's up axis is pointing to bearing from south direction of map
        // default [0,1,0] is the Y axis while the angle of inclination always equal 0
        // if you want to rotate the map after up an incline,please rotateZ like this:
        // let up = new vec3(0,1,0);
        // up.rotateZ(target,radians);
        return {
            eye: [cx, cy, cz],
            fov: ratio,
            width: size.width,
            height: size.height
        };
    };

    DeckGLRenderer.prototype.onCanvasCreate = function onCanvasCreate() {
        var _viewParams = this._getLookAtMat();
        var viewport = new deck_gl.PerspectiveViewport(_viewParams);
        var layerManager = new deck_gl.LayerManager({ gl: this.gl });
        layerManager.setViewport(viewport);
        this.layerManager = layerManager;
    };

    DeckGLRenderer.prototype.onRemove = function onRemove() {};

    DeckGLRenderer.prototype.renderScene = function renderScene() {
        var _viewParams = this._getLookAtMat();
        var viewport = new deck_gl.PerspectiveViewport(_viewParams);
        this.layerManager.setViewport(viewport);
        this.layerManager.updateLayers();
        this.completeRender();
    };

    return DeckGLRenderer;
}(maptalks.renderer.CanvasLayerRenderer);

DeckGLLayer.registerRenderer('canvas', DeckGLRenderer);
DeckGLLayer.registerRenderer('webgl', DeckGLRenderer);

exports.DeckGLLayer = DeckGLLayer;
exports.DeckGLRenderer = DeckGLRenderer;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.deckgl v0.0.0, requires maptalks@^0.25.1.');

})));
