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
define(["require", "exports", "easyvg", "matrix2"], function (require, exports, easyvg_1, matrix2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ElementTransformer = (function () {
        function ElementTransformer(target) {
            this.target = new easyvg_1.SvgGraphicElement(target);
            var canvas = new easyvg_1.SvgElement(this.target.nativeElement.ownerSVGElement);
            this._container = new easyvg_1.SvgGraphicElement('g', { transform: this.target.getAttr('transform') });
            canvas.append(this._container);
            this._createPath();
            this._createDragger();
            this._createRotateHandle();
            this._createResizeHandles();
            this._createScaleHandles();
        }
        ElementTransformer.prototype._createPath = function () {
            var box = this.target.nativeElement.getBBox();
            var path = new easyvg_1.SvgPath()
                .moveTo(new matrix2_1.Point(box.x + box.width / 2, box.y - 30))
                .lineTo(new matrix2_1.Point(box.x + box.width / 2, box.y))
                .lineTo(new matrix2_1.Point(box.x, box.y))
                .lineTo(new matrix2_1.Point(box.x, box.y + box.height))
                .lineTo(new matrix2_1.Point(box.x + box.width, box.y + box.height))
                .lineTo(new matrix2_1.Point(box.x + box.width, box.y))
                .lineTo(new matrix2_1.Point(box.x + box.width / 2, box.y));
            this._container.append(path);
        };
        ElementTransformer.prototype._createDragger = function () {
            var box = this.target.nativeElement.getBBox();
            var rect = new easyvg_1.SvgElement('rect', {
                x: box.x,
                y: box.y,
                fill: '000',
                opacity: .5,
                width: box.width,
                height: box.height
            });
            this._container.append(rect);
        };
        ElementTransformer.prototype._createRotateHandle = function () {
            var self = this;
            var box = this.target.nativeElement.getBBox();
            var rotateHandle = new Handle();
            rotateHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y - 30);
            this._container.append(rotateHandle);
            rotateHandle.nativeElement.addEventListener('mousedown', function (event) {
                var p = new matrix2_1.Point(event.offsetX, event.offsetY);
                var t = self._container.transformation;
                var q = p.transform(t.inverse());
                console.log(q.toString());
            });
        };
        ElementTransformer.prototype._createResizeHandles = function () {
            var box = this.target.nativeElement.getBBox();
            var topLeftHandle = new Handle();
            topLeftHandle.position = new matrix2_1.Point(box.x, box.y);
            this._container.append(topLeftHandle);
            var topRightHandle = new Handle();
            topRightHandle = new Handle();
            topRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y);
            this._container.append(topRightHandle);
            var bottomLeftHandle = new Handle();
            bottomLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height);
            this._container.append(bottomLeftHandle);
            var bottomRightHandle = new Handle();
            bottomRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height);
            this._container.append(bottomRightHandle);
        };
        ElementTransformer.prototype._createScaleHandles = function () {
            var box = this.target.nativeElement.getBBox();
            var topMiddleHandle = new Handle();
            topMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y);
            this._container.append(topMiddleHandle);
            var self = this;
            topMiddleHandle.nativeElement.addEventListener('mousedown', function (event) {
                var p = new matrix2_1.Point(event.clientX, event.clientY);
                var t = self._container.transformation;
                var q = p.transform(t.inverse());
                console.log(q.toString());
            });
            var middleRightHandle = new Handle();
            middleRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height / 2);
            this._container.append(middleRightHandle);
            var bottomMiddleHandle = new Handle();
            bottomMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y + box.height);
            this._container.append(bottomMiddleHandle);
            var middleLeftHandle = new Handle();
            middleLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height / 2);
            this._container.append(middleLeftHandle);
        };
        return ElementTransformer;
    }());
    exports.ElementTransformer = ElementTransformer;
    var Handle = (function (_super) {
        __extends(Handle, _super);
        function Handle() {
            var _this = _super.call(this, 'circle') || this;
            _this._radius = 10;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this._fillColor = 'transparent';
            _this
                .setAttr('r', _this._radius)
                .setAttr('stroke', _this._strokeColor)
                .setAttr('stroke-width', _this._strokeWidth)
                .setAttr('fill', _this._fillColor);
            return _this;
        }
        Object.defineProperty(Handle.prototype, "position", {
            get: function () {
                var x = parseInt(this.getAttr('cx'), 10);
                var y = parseInt(this.getAttr('cy'), 10);
                return new matrix2_1.Point(x, y);
            },
            set: function (value) {
                this
                    .setAttr('cx', value.x)
                    .setAttr('cy', value.y);
            },
            enumerable: true,
            configurable: true
        });
        return Handle;
    }(easyvg_1.SvgGraphicElement));
});
