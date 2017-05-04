var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "matrix2"], function (require, exports, matrix2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ElementTransformer = (function () {
        function ElementTransformer(target) {
            this.target = new Element(target);
            var canvas = new Element(this.target.nativeElement.ownerSVGElement);
            this._container = new Element('g').appendTo(canvas);
            this._createPath();
            this._createDragger();
            this._createRotateHandle();
            this._createResizeHandles();
            this._createScaleHandles();
        }
        ElementTransformer.prototype._createPath = function () {
            var box = this.target.nativeElement.getBBox();
            new Path()
                .moveTo(new matrix2_1.Point(box.x + box.width / 2, box.y - 30))
                .lineTo(new matrix2_1.Point(box.x + box.width / 2, box.y))
                .lineTo(new matrix2_1.Point(box.x, box.y))
                .lineTo(new matrix2_1.Point(box.x, box.y + box.height))
                .lineTo(new matrix2_1.Point(box.x + box.width, box.y + box.height))
                .lineTo(new matrix2_1.Point(box.x + box.width, box.y))
                .lineTo(new matrix2_1.Point(box.x + box.width / 2, box.y))
                .appendTo(this._container);
        };
        ElementTransformer.prototype._createDragger = function () {
            var box = this.target.nativeElement.getBBox();
            var rect = new Element('rect')
                .setAttribute('x', box.x)
                .setAttribute('x', box.x)
                .setAttribute('y', box.y)
                .setAttribute('fill', '000')
                .setAttribute('opacity', '.5')
                .setAttribute('width', box.width)
                .setAttribute('height', box.height)
                .appendTo(this._container);
        };
        ElementTransformer.prototype._createRotateHandle = function () {
            var box = this.target.nativeElement.getBBox();
            var rotateHandle = new Handle();
            rotateHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y - 30);
            rotateHandle.appendTo(this._container);
        };
        ElementTransformer.prototype._createResizeHandles = function () {
            var box = this.target.nativeElement.getBBox();
            var topLeftHandle = new Handle();
            topLeftHandle.position = new matrix2_1.Point(box.x, box.y);
            topLeftHandle.appendTo(this._container);
            var topRightHandle = new Handle();
            topRightHandle = new Handle();
            topRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y);
            topRightHandle.appendTo(this._container);
            var bottomLeftHandle = new Handle();
            bottomLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height);
            bottomLeftHandle.appendTo(this._container);
            var bottomRightHandle = new Handle();
            bottomRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height);
            bottomRightHandle.appendTo(this._container);
        };
        ElementTransformer.prototype._createScaleHandles = function () {
            var box = this.target.nativeElement.getBBox();
            var topMiddleHandle = new Handle();
            topMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y);
            topMiddleHandle.appendTo(this._container);
            var middleRightHandle = new Handle();
            middleRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height / 2);
            middleRightHandle.appendTo(this._container);
            var bottomMiddleHandle = new Handle();
            bottomMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y + box.height);
            bottomMiddleHandle.appendTo(this._container);
            var middleLeftHandle = new Handle();
            middleLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height / 2);
            middleLeftHandle.appendTo(this._container);
        };
        return ElementTransformer;
    }());
    exports.ElementTransformer = ElementTransformer;
    var Element = (function () {
        function Element(target) {
            if (typeof target == 'string') {
                this.nativeElement = document.createElementNS('http://www.w3.org/2000/svg', target);
            }
            else {
                this.nativeElement = target;
            }
        }
        Element.prototype.getAttribute = function (name) {
            return this.nativeElement.getAttributeNS(null, name);
        };
        Element.prototype.setAttribute = function (name, value) {
            this.nativeElement.setAttributeNS(null, name, '' + value);
            return this;
        };
        Element.prototype.appendTo = function (element) {
            element.nativeElement.appendChild(this.nativeElement);
            return this;
        };
        return Element;
    }());
    var Handle = (function (_super) {
        __extends(Handle, _super);
        function Handle() {
            var _this = _super.call(this, 'circle') || this;
            _this._radius = 10;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this._fillColor = 'transparent';
            _this
                .setAttribute('r', _this._radius)
                .setAttribute('stroke', _this._strokeColor)
                .setAttribute('stroke-width', _this._strokeWidth)
                .setAttribute('fill', _this._fillColor);
            return _this;
        }
        Object.defineProperty(Handle.prototype, "position", {
            get: function () {
                var x = parseInt(this.getAttribute('cx'), 10);
                var y = parseInt(this.getAttribute('cy'), 10);
                return new matrix2_1.Point(x, y);
            },
            set: function (value) {
                this
                    .setAttribute('cx', value.x)
                    .setAttribute('cy', value.y);
            },
            enumerable: true,
            configurable: true
        });
        return Handle;
    }(Element));
    var Path = (function (_super) {
        __extends(Path, _super);
        function Path() {
            var _this = _super.call(this, 'path') || this;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this
                .setAttribute('stroke', _this._strokeColor)
                .setAttribute('stroke-width', _this._strokeWidth)
                .setAttribute('fill', 'transparent');
            return _this;
        }
        Path.prototype.moveTo = function (value) {
            this.setAttribute('d', [this.getAttribute('d') || '', "M" + value.x + " " + value.y].join(' '));
            return this;
        };
        Path.prototype.lineTo = function (value) {
            this.setAttribute('d', [this.getAttribute('d') || '', "L" + value.x + " " + value.y].join(' '));
            return this;
        };
        return Path;
    }(Element));
});
