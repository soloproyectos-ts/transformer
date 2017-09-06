import { SvgGraphicElement } from 'easyvg';
export declare class ElementTransformer {
    readonly target: SvgGraphicElement;
    private _container;
    constructor(target: SvgGraphicElement);
    private _createPath();
    private _createDragger();
    private _createRotateHandle();
    private _createResizeHandles();
    private _getBoundingBox();
    private _getCenter();
}
