import * as maptalks from 'maptalks';
import * as deck from '@deck.gl/core';

const retina = maptalks.Browser.retina ? 2 : 1;

class DeckGLRenderer extends maptalks.renderer.CanvasRenderer {

    draw() {
        this.prepareCanvas();
        const map = this.getMap();
        const viewState = this._getViewState(),
            props = this.layer.getProps();
        const p = maptalks.Util.extend({}, props, { viewState, targetMap: map });
        this.deck.setProps(p);
        this.deck._drawLayers();
        this.completeRender();
    }

    drawOnInteracting() {
        this.draw();
    }

    clearCanvas() {
        if (!this.canvas) return;
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    /**
     * when map changed, call canvas change
     * @param canvasSize
     */
    resizeCanvas(canvasSize) {
        if (!this.canvas) return;
        const size = canvasSize ? canvasSize : this.getMap().getSize();
        if (this.canvas.width !== size.width * retina || this.canvas.height !== size.height * retina) {
            this.canvas.height = retina * size.height;
            this.canvas.width = retina * size.width;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    createContext() {
        if (this.canvas.gl && this.canvas.gl.wrap) {
            this.gl = this.canvas.gl.wrap();
        } else {
            const layer = this.layer;
            const attributes = layer.options.glOptions || {
                alpha: true,
                depth: true,
                antialias: true,
                stencil : true
            };
            attributes.preserveDrawingBuffer = true;
            this.gl = this.gl || this._createGLContext(this.canvas, attributes);
        }
        this._createDeck();
    }

    _getViewState() {
        const map = this.getMap();
        const maxZoom = map.getMaxNativeZoom();
        const center = map.getCenter();
        const pitch = map.getPitch();
        const bearing = map.getBearing();
        const zoom = getMapBoxZoom(map.getResolution());
        return {
            latitude: center['y'],
            longitude: center['x'],
            zoom,
            bearing,
            pitch,
            maxZoom
        };
    }

    _createDeck() {
        const map = this.getMap();
        const deckProps = {
            useDevicePixels: true,
            _customRender: () => this.setCanvasUpdated(),
            parameters: {
                depthMask: true,
                depthTest: true
            },
            viewState : this._getViewState()
        };

        Object.assign(deckProps, {
            gl : this.gl,
            width: false,
            height: false,
            autoResizeDrawingBuffer : false

        });
        const d = new deck.Deck(deckProps);
        d._setGLContext(this.gl);

        initEvents(map, d);

        this.deck = d;

        return d;
    }

    remove() {
        this.deck.finalize();
        super.remove();
    }

    _createGLContext(canvas, options) {
        const names = ['webgl', 'experimental-webgl'];
        let context = null;
        /* eslint-disable no-empty */
        for (let i = 0; i < names.length; ++i) {
            try {
                context = canvas.getContext(names[i], options);
            } catch (e) {}
            if (context) {
                break;
            }
        }
        return context;
        /* eslint-enable no-empty */
    }
}

// Register deck callbacks for pointer events
function initEvents(map, deck) {
    const pickingEventHandler = event => handleMouseEvent(deck, event);

    if (deck.eventManager) {
        // Replace default event handlers with our own ones
        deck.eventManager.off({
            click: deck._onClick,
            pointermove: deck._onPointerMove,
            pointerleave: deck._onPointerLeave
        });
        deck.eventManager.on({
            click: pickingEventHandler,
            pointermove: pickingEventHandler,
            pointerleave: pickingEventHandler
        });
    } else {
        map.on('click', pickingEventHandler);
        map.on('mousemove', pickingEventHandler);
        map.on('mouseleave', pickingEventHandler);
    }
}


// Triggers picking on a mouse event
function handleMouseEvent(deck, event) {
    // reset layerFilter to allow all layers during picking
    deck.layerManager.layerFilter = null;

    let callback;
    switch (event.type) {
    case 'click':
        callback = deck._onClick;
        break;

    case 'mousemove':
    case 'pointermove':
        callback = deck._onPointerMove;
        break;

    case 'mouseleave':
    case 'pointerleave':
        callback = deck._onPointerLeave;
        break;

    default:
        return;
    }

    if (!event.offsetCenter) {
        // Map from mapbox's MapMouseEvent object to mjolnir.js' Event object
        event = {
            offsetCenter: event.point,
            srcEvent: event.originalEvent
        };
    }
    callback(event);
}

export default DeckGLRenderer;

const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));
function getMapBoxZoom(res) {
    return 19 - Math.log(res / MAX_RES) / Math.LN2;
}
