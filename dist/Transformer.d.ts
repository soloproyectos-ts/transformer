export declare namespace svg {
    class Element {
        protected target: SVGElement;
        constructor(target: string | SVGElement);
        readonly nativeElement: SVGElement;
        readonly ownerSvgElement: GraphicElement;
        getAttribute(name: string): string;
        setAttribute(name: string, value: any): void;
        appendChild(element: Element): void;
    }
    class GraphicElement extends Element {
        constructor(target: string | SVGGraphicsElement);
        readonly nativeElement: SVGGraphicsElement;
        getBox(): {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }
}
export declare class ElementTransformer {
    readonly target: svg.GraphicElement;
    constructor(target: SVGGraphicsElement);
}
