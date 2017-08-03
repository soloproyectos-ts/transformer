/// <reference path="../typings/index" />

import {SvgElement, SvgGraphicElement, SvgPath} from 'easyvg';
import {SquareMatrix} from 'matrix';
import {Line, Point, Vector, Positionable, Transformation, rad2deg} from 'matrix2';

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: SvgGraphicElement;
  private _container: SvgGraphicElement;

  // TODO: replace SVGGraphicsElement by SvgGraphicElement ?
  constructor (target: SVGGraphicsElement) {
    this.target = new SvgGraphicElement(target);

    // creates the container group
    let canvas = new SvgElement(this.target.nativeElement.ownerSVGElement);
    this._container = new SvgGraphicElement('g');
    this._container.transform(this.target.transformation);
    canvas.append(this._container);

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.nativeElement.getBBox();
    let path = new SvgPath()
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
    let rect = new SvgElement(
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
    let self = this;
    let box = this.target.nativeElement.getBBox();
    let rotateHandle = new Handle(this._container);

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);

    //let p0: Point;
    //let p1: Point;
    let canvas = this.target.nativeElement.ownerSVGElement;
    let ctm = self.target.nativeElement.getCTM();
    let t = Transformation.createFromValues(
      ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f
    );
    let c = new Point(box.x + box.width / 2, box.y + box.width / 2);
    let initT: Transformation;
    rotateHandle.onStartDragging(() => initT = self._container.transformation);
    rotateHandle.onDragging(function (p0, p1) {
      let p2 = c.transform(t);

      let alpha = _getAdjacentAngle(p0, p1, p2);
      let p3 = c.transform(self.target.transformation);
      let t0 = initT.rotate(alpha, p3);
      self._container.transformation = t0;
    });
  }

  private _createResizeHandles() {
    let box = this.target.nativeElement.getBBox();

    let topLeftHandle = new Handle(this._container);
    topLeftHandle.position = new Point(box.x, box.y);

    let topRightHandle = new Handle(this._container);
    topRightHandle.position = new Point(box.x + box.width, box.y);

    let bottomLeftHandle = new Handle(this._container);
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);

    let bottomRightHandle = new Handle(this._container);
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
  }

  private _createScaleHandles() {
    let box = this.target.nativeElement.getBBox();

    let topMiddleHandle = new Handle(this._container);
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);

    let self = this;
    topMiddleHandle.nativeElement.addEventListener('mousedown', function (event) {
      let p = new Point(event.clientX, event.clientY);
      let t = self._container.transformation;
      let q = p.transform(t.inverse());

      console.log(q.toString());
    });

    let middleRightHandle = new Handle(this._container);
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );

    let bottomMiddleHandle = new Handle(this._container);
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );

    let middleLeftHandle = new Handle(this._container);
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
  }
}

class Handle extends SvgGraphicElement {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';
  private _initPoint: Point;

  constructor(parent: SvgGraphicElement) {
    super('circle');

    this
      .setAttr('r', this._radius)
      .setAttr('stroke', this._strokeColor)
      .setAttr('stroke-width', this._strokeWidth)
      .setAttr('fill', this._fillColor);

    let self = this;
    let canvas = parent.nativeElement.ownerSVGElement;
    canvas.addEventListener('mousedown', function (event) {
      let target = event.target;
      if (target == self.nativeElement) {
        self._initPoint = new Point(event.offsetX, event.offsetY);
      }
    });
    canvas.addEventListener('mouseup', function (event) {
      self._initPoint = null;
    });

    parent.append(this);
  }

  onStartDragging(listener: (init: Point) => void) {
    let self = this;
    let canvas = this.nativeElement.ownerSVGElement;

    canvas.addEventListener('mousedown', function (event) {
      listener.apply(self, [new Point(event.offsetX, event.offsetY)]);
    });
  }

  onDragging(listener: (init: Point, final: Point) => void) {
    let self = this;
    let canvas = this.nativeElement.ownerSVGElement;

    canvas.addEventListener('mousemove', function (event) {
      if (self._initPoint != null) {
        let finalPoint = new Point(event.offsetX, event.offsetY);

        listener.apply(self, [self._initPoint, finalPoint]);
      }
    });
  }

  onStopDragging(listener: (final: Point) => void) {
    let self = this;
    let canvas = this.nativeElement.ownerSVGElement;

    canvas.addEventListener('mouseup', function (event) {
      listener.apply(self, [new Point(event.offsetX, event.offsetY)]);
    });
  }

  get position(): Point {
    let x = parseInt(this.getAttr('cx'), 10);
    let y = parseInt(this.getAttr('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this
      .setAttr('cx', value.x)
      .setAttr('cy', value.y);
  }
}

// Gets the angle adjacent to [p2] of the triangle defined by
// [p0], [p1] and [p2] in the direction of the hands of a clock.
//
// Just imagine that the segment [p0, p2] is the hour hand and
// the segment [p1, p2] is the minute hand. This function calculates the
// angle enclosed between those two hands in the direction of the hands
// of a clock.
function _getAdjacentAngle(p0: Point, p1: Point, p2: Point): number {
  // creates an orthonormal reference system
  let u = Vector.createFromPoints(p1, p2);
	let u0 = u.unit();
  let u1 = new Vector(u0.y, -u0.x);

  // expresses the vector [p2, p0] from the orthonormal reference system
	let v = Vector.createFromPoints(p0, p2);
	let m = new SquareMatrix(u0, u1);
	let w = v.multiply(m.inverse());

	return _getAngle(w);
}

// Gets the angle of a 'positionable' object.
function _getAngle(p: Positionable): number {
	let ret = NaN;
	let [x, y] = [p.x, p.y];

	if (x > 0 && !(y < 0)) {
		// first quadrant
		ret = Math.atan(y / x);
	} else if (!(x > 0) && y > 0) {
		// second quadrant
		ret = x < 0
			? Math.atan(y / x) + Math.PI
			: Math.PI / 2;
	} else if (x < 0 && !(y > 0)) {
		// third quadrant
		ret = Math.atan(y / x) + Math.PI;
	} else if (!(x < 0) && y < 0) {
		// fourth quadrant
		ret = x > 0
			? Math.atan(y / x) + 2 * Math.PI
			: 3 * Math.PI / 2;
	}

	return ret;
}
