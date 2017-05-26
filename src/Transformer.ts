/// <reference path="../typings/index" />

import {Point, Vector} from 'matrix';
import {Transformation} from 'matrix2';

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: Element<SVGGraphicsElement>;
  private _container: Element<SVGGraphicsElement>;

  constructor (target: SVGGraphicsElement) {
    this.target = new Element(target);

    // creates the container group
    let canvas = new Element(this.target.nativeElement.ownerSVGElement);
    this._container = new Element<SVGGraphicsElement>(
      'g', {transform: this.target.getAttribute('transform')}
    );
    canvas.append(this._container);

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.nativeElement.getBBox();
    let path = new Path()
      .moveTo(new Point(box.x + box.width / 2, box.y - 30))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .lineTo(new Point(box.x, box.y))
      .lineTo(new Point(box.x, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y))
      .lineTo(new Point(box.x + box.width / 2, box.y));

    this._container.append(path);
  }

  private _createDragger() {
    let box = this.target.nativeElement.getBBox();
    let rect = new Element(
      'rect',
      {
        x: box.x,
        y: box.y,
        fill: '000',
        opacity: .5,
        width: box.width,
        height: box.height
      }
    );

    this._container.append(rect);

    /*
    rect.nativeElement.addEventListener('mousedown', function (event: MouseEvent) {
        console.log(rect.getLocalPosition(new Point(event.clientX, event.clientY)));
      });*/
  }

  private _createRotateHandle() {
    let box = this.target.nativeElement.getBBox();
    let rotateHandle = new Handle();

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    this._container.append(rotateHandle);
  }

  private _createResizeHandles() {
    let box = this.target.nativeElement.getBBox();

    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    this._container.append(topLeftHandle);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    this._container.append(topRightHandle);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    this._container.append(bottomLeftHandle);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    this._container.append(bottomRightHandle);
  }

  private _createScaleHandles() {
    let box = this.target.nativeElement.getBBox();

    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    this._container.append(topMiddleHandle);

    let self = this;
    topMiddleHandle.nativeElement.addEventListener('mousedown', function (event) {
      let p = new Point(event.offsetX, event.offsetY);
      let t = self._container.nativeElement.getCTM();
      let m = Transformation.createFromValues(t.a, t.b, t.c, t.d, t.e, t.f);
      let q = p.transform(m.inverse());

      console.log(q.toString());
    });

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    this._container.append(middleRightHandle);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    this._container.append(bottomMiddleHandle);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    this._container.append(middleLeftHandle);
  }
}

class Element<Type extends SVGElement> {
  readonly nativeElement: Type;

  constructor (target: string | Type, attributes: Object = {}) {
    if ( typeof target == 'string' ) {
      this.nativeElement = <Type> document.createElementNS(
        'http://www.w3.org/2000/svg', target
      );
    } else {
      this.nativeElement = target;
    }

    for (let key in attributes) {
      this.setAttribute(key, attributes[key]);
    }
  }

  getAttribute(name: string): string {
    return this.nativeElement.getAttributeNS(null, name);
  }

  setAttribute(name: string, value: any): Element<Type> {
    this.nativeElement.setAttributeNS(null, name, '' + value);

    return this;
  }

  append(element: Element<SVGElement>): void {
    this.nativeElement.appendChild(element.nativeElement);
  }
}

class Handle extends Element<SVGGraphicsElement> {
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

class Path extends Element<SVGGraphicsElement> {
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
