import * as maptalks from 'maptalks';
import DeckGLRenderer from './DeckGLRenderer';

const options = {
    renderer : 'gl'
};

class DeckGLLayer extends maptalks.Layer {
    constructor(id, props, options) {
        super(id, options);
        this._props = props;
    }

    getProps() {
        return this._props;
    }

    setProps(props) {
        this._props = Object.assign(this._props, props);
        const renderer = this.getRenderer();
        if (renderer) {
            renderer.setToRedraw();
        }
        return this;
    }

}

DeckGLLayer.mergeOptions(options);

DeckGLLayer.registerRenderer('gl', DeckGLRenderer);

export default DeckGLLayer;
