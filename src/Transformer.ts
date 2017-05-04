/// <reference path="../typings/index" />

import {Point} from 'matrix2';

export namespace svg {
  const namespace = 'http://www.w3.org/2000/svg';

  export class Element {
    protected target: SVGElement;

    constructor(target: string | SVGElement) {
      if ( typeof target == 'string' ) {
        this.target = document.createElementNS(namespace, target);
      } else {
        this.target = target;
      }
    }

    get nativeElement(): SVGElement {
      return this.target;
    }

    get ownerSvgElement(): SvgElement {
      return new SvgElement(this.nativeElement.ownerSVGElement);
    }

    getAttribute(name: string): string {
      return this.target.getAttributeNS(null, name);
    }

    setAttribute(name: string, value: any): Element {
      this.target.setAttributeNS(null, name, '' + value);

      return this;
    }

    appendTo(element: Element): Element {
      element.nativeElement.appendChild(this.nativeElement);

      return this;
    }
  }

  export class GraphicElement extends Element {

    constructor(target: string | SVGGraphicsElement) {
      super(target);

      if ( !(this.nativeElement instanceof SVGGraphicsElement) ) {
        throw 'Argument error: invalid target';
      }
    }

    get nativeElement(): SVGGraphicsElement {
      return <SVGGraphicsElement> this.target;
    }

    getBoundingBox(): {x: number, y: number, width: number, height: number} {
      let box = this.nativeElement.getBBox();
      return {x: box.x, y: box.y, width: box.width, height: box.height};
    }

    getLocalPosition(clientPosition: Point): Point {
      let canvas = this.ownerSvgElement.nativeElement;

      // creates a point
      let pos = canvas.createSVGPoint();
      pos.x = clientPosition.x;
      pos.y = clientPosition.y;

      // creates a local point
      let localPoint = pos.matrixTransform(canvas.getScreenCTM().inverse());

      return new Point(localPoint.x, localPoint.y);
    }

    appendTo(element: Element): GraphicElement {
      super.appendTo(element);

      return this;
    }
  }

  export class SvgElement extends GraphicElement {
    constructor(target: string | SVGSVGElement) {
      super(target);

      if ( !(this.nativeElement instanceof SVGSVGElement) ) {
        throw 'Argument error: invalid target';
      }
    }

    get nativeElement(): SVGSVGElement {
      return <SVGSVGElement> this.target;
    }

    appendTo(element: Element): SvgElement {
      super.appendTo(element);

      return this;
    }
  }
}

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: svg.GraphicElement;
  private _container: svg.GraphicElement;

  constructor (target: SVGGraphicsElement) {
    this.target = new svg.GraphicElement(target);

    // creates the container group
    let canvas = this.target.ownerSvgElement;
    this._container = new svg.GraphicElement('g').appendTo(canvas);

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.getBoundingBox();

    new Path()
      .moveTo(new Point(box.x + box.width / 2, box.y - 30))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .lineTo(new Point(box.x, box.y))
      .lineTo(new Point(box.x, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .appendTo(this._container);
  }

  private _createDragger() {
    let box = this.target.getBoundingBox();

    let rect = new svg.GraphicElement('rect')
      .setAttribute('x', box.x)
      .setAttribute('x', box.x)
      .setAttribute('y', box.y)
      .setAttribute('fill', '000')
      .setAttribute('opacity', '.5')
      .setAttribute('width', box.width)
      .setAttribute('height', box.height)
      .appendTo(this._container);

    /*
    rect.nativeElement.addEventListener('mousedown', function (event: MouseEvent) {
        console.log(rect.getLocalPosition(new Point(event.clientX, event.clientY)));
      });*/
  }

  private _createRotateHandle() {
    let box = this.target.getBoundingBox();
    let rotateHandle = new Handle();

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    rotateHandle.appendTo(this._container);
  }

  private _createResizeHandles() {
    let box = this.target.getBoundingBox();

    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    topLeftHandle.appendTo(this._container);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    topRightHandle.appendTo(this._container);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    bottomLeftHandle.appendTo(this._container);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    bottomRightHandle.appendTo(this._container);
  }

  private _createScaleHandles() {
    let box = this.target.getBoundingBox();

    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    topMiddleHandle.appendTo(this._container);

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    middleRightHandle.appendTo(this._container);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    bottomMiddleHandle.appendTo(this._container);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    middleLeftHandle.appendTo(this._container);
  }
}

class Handle extends svg.GraphicElement {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';

  constructor() {
    super('circle');

    this
      .setAttribute('r', this._radius)
      .setAttribute('stroke', this._strokeColor)
      .setAttribute('stroke-width', this._strokeWidth)
      .setAttribute('fill', this._fillColor);
  }

  get position(): Point {
    let x = parseInt(this.getAttribute('cx'), 10);
    let y = parseInt(this.getAttribute('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this
      .setAttribute('cx', value.x)
      .setAttribute('cy', value.y);
  }
}

class Path extends svg.GraphicElement {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this
      .setAttribute('stroke', this._strokeColor)
      .setAttribute('stroke-width', this._strokeWidth)
      .setAttribute('fill', 'transparent');
  }

  moveTo(value: Point): Path {
    this.setAttribute(
      'd', [this.getAttribute('d') || '', `M${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  lineTo(value: Point): Path {
    this.setAttribute(
      'd', [this.getAttribute('d') || '', `L${value.x} ${value.y}`].join(' ')
    );

    return this;
  }
}
