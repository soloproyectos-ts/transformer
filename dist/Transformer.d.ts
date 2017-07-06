import { SvgGraphicElement } from 'easyvg';
import { Positionable } from 'matrix2';
export declare class ElementTransformer {
    readonly target: SvgGraphicElement;
    private _container;
    constructor(target: SVGGraphicsElement);
    private _createPath();
    private _createDragger();
    private _createRotateHandle();
    private _createResizeHandles();
    private _createScaleHandles();
    private _getCenter();
}
export declare function getAngle(p: Positionable): number;
