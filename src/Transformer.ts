/// <reference path="../typings/index" />
import {Point} from 'matrix2';

export namespace svg {
  const namespace = 'http://www.w3.org/2000/svg';

  export class Element {
    protected target: SVGElement;

    constructor(target: string | SVGElement) {
      if ( typeof target == 'string' ) {
        this.target = <SVGElement> document.createElementNS(namespace, target);
      } else {
        this.target = target;
      }
    }

    get nativeElement(): SVGElement {
      return this.target;
    }

    get ownerSvgElement(): GraphicElement {
      return new GraphicElement(this.nativeElement.ownerSVGElement);
    }

    getAttribute(name: string): string {
      return this.target.getAttributeNS(null, name);
    }

    setAttribute(name: string, value: any): void {
      this.target.setAttributeNS(null, name, '' + value);
    }

    appendChild(element: Element): void {
      this.nativeElement.appendChild(element.nativeElement);
    }
  }

  export class GraphicElement extends Element {

    constructor(target: string | SVGGraphicsElement) {
      super(target);

      if ( !(this.nativeElement instanceof SVGGraphicsElement) ) {
        throw 'ArgumentError: invalid target';
      }
    }

    get nativeElement(): SVGGraphicsElement {
      return <SVGGraphicsElement> this.target;
    }

    getBox(): {x: number, y: number, width: number, height: number} {
      let box = this.nativeElement.getBBox();
      return {x: box.x, y: box.y, width: box.width, height: box.height};
    }
  }
}

class Handle extends svg.GraphicElement {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';

  constructor() {
    super('circle');

    this.setAttribute('r', this._radius);
    this.setAttribute('stroke', this._strokeColor);
    this.setAttribute('stroke-width', this._strokeWidth);
    this.setAttribute('fill', this._fillColor);
  }

  get position(): Point {
    let x = parseInt(this.getAttribute('cx'), 10);
    let y = parseInt(this.getAttribute('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this.setAttribute('cx', value.x);
    this.setAttribute('cy', value.y);
  }
}

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: svg.GraphicElement;

  constructor (target: SVGGraphicsElement) {
    this.target = new svg.GraphicElement(target);

    let box = this.target.getBox();
    let canvas = this.target.ownerSvgElement;
    let group = new svg.GraphicElement('g');
    canvas.appendChild(group);

    // rotate handle
    let rotateHandle = new Handle();
    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    group.appendChild(rotateHandle);

    // resize handles
    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    group.appendChild(topLeftHandle);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    group.appendChild(topRightHandle);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    group.appendChild(bottomLeftHandle);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    group.appendChild(bottomRightHandle);

    // scale handles
    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    group.appendChild(topMiddleHandle);

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    group.appendChild(middleRightHandle);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    group.appendChild(bottomMiddleHandle);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    group.appendChild(middleLeftHandle);
  }
}
