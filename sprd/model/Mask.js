define(["sprd/model/AfterEffect", "sprd/model/Design", "sprd/entity/Offset", "sprd/entity/Scale", "flow", "rAppid"], function(AfterEffect, Design, Offset, Scale, flow, rappid) {

    return AfterEffect.inherit("sketchomat.model.Mask", {
        defaults: {
            htmlImage: null,
            offset: Offset,
            scale: Scale,
            fixedAspectRatio: false,
            maxOffset: Offset,
            maxScale: Scale,
            destinationWidth: null,
            destinationHeight: null
        },

        ctor: function() {
            this.callBase();
            this.initImage();

            this.$.offset.set('unit', 'px');
            this.$.maxOffset.set('unit', 'px');

            this.bind('change:destinationWidth', this.repositionMask, this);
            this.bind('change:destinationHeight', this.repositionMask, this);
            this.bind('offset', 'change', this.offsetChanged, this);
            this.bind('scale', 'change', this.scaleChanged, this);

            this.initMaxScale();
        },

        scaleChanged: function() {
            this.recalculateMaxOffset();
            this.trigger("processingParametersChanged");
        },

        offsetChanged: function() {
            this.recalculateMaxScale();
            this.trigger("processingParametersChanged");
        },

        initImage: function(callback) {
            callback && callback(new Error("Not implemented"));
        },

        centerAt: function(x, y) {
            this.$.offset.set({
                'x': x - this.width() / 2,
                'y': y - this.height() / 2
            });
        },

        height: function(scale) {
            var img = this.$.htmlImage;
            if (img) {
                return (scale || this.get('scale.y')) * img.naturalHeight;
            }

            return null;
        },

        width: function(scale) {
            var img = this.$.htmlImage;
            if (img) {
                return (scale || this.get('scale.x')) * img.naturalWidth;
            }

            return null;
        },

        repositionMask: function() {
            var width = this.$.destinationWidth;
            var height = this.$.destinationHeight;
            this.unbind('scale', 'change', this.adjustOffset, this);

            var originalWidth = this.width(1);
            var originalHeight = this.height(1);
            if (width && height && originalWidth && originalHeight && !this.$.initialized) {
                var factor = Math.min(width / originalWidth, height / originalHeight);
                this.$.scale.set('y', factor);
                this.$.scale.set('x', factor);

                this.$.offset.set('x', Math.floor((width - this.width()) / 2));
                this.$.offset.set('y', Math.floor((height - this.height()) / 2));
                this.set('initialized', true);
            }

            this.bind('scale', 'change', this.adjustOffset, this);
        },

        initMaxOffSet: function() {
            this.calculateMaxOffset(1, 1);
        },

        recalculateMaxOffset: function() {
            this.calculateMaxOffset(this.$.scale.$.x, this.$.scale.$.y);
        },

        calculateMaxOffset: function(x, y) {
            var maxOffset = this.$.maxOffset;
            var width = this.$.destinationWidth;
            var height = this.$.destinationHeight;

            if (!maxOffset) {
                return;
            }
            var xScale = x;
            var yScale = y;

            if (xScale) {
                this.$.maxOffset.set('x', Math.max(this.get('offset.x'), width - this.width(xScale), 1));
            }

            if (yScale) {
                this.$.maxOffset.set('y', Math.max(this.get('offset.y'), height - this.height(yScale), 1));
            }
        },

        initMaxScale: function() {
            this.calculateMaxScale(0, 0);
        },

        recalculateMaxScale: function() {
            this.calculateMaxScale(this.$.offset.$.x, this.$.offset.$.y);
        },

        calculateMaxScale: function(x, y) {
            var maxScale = this.$.maxScale;
            var width = this.$.destinationWidth;
            var height = this.$.destinationHeight;

            if (!maxScale) {
                return;
            }

            var xOffset = x;
            var yOffset = y;

            if (typeof xOffset === 'number') {
                this.$.maxScale.set('x', Math.max(this.get('scale.x'), (width - xOffset) / this.width(1)));
            }

            if (typeof yOffset === 'number') {
                this.$.maxScale.set('y', Math.max(this.get('scale.y'), (height - yOffset) / this.height(1)));
            }
        },

        adjustOffset: function(e) {
            var offset = this.get('offset');

            var newScaleX = e.$.x;
            var oldScaleX = e.target.$previousAttributes['x'];
            if (newScaleX && oldScaleX) {
                offset.set('x', Math.max(0, offset.get('x') + 0.5 * this.width(oldScaleX - newScaleX)));
            }

            var newScaleY = e.$.y;
            var oldScaleY = e.target.$previousAttributes['y'];
            if (newScaleY && oldScaleY) {
                offset.set('y', Math.max(0, offset.get('y') + 0.5 * this.height(oldScaleY - newScaleY)));
            }
        },


        scaleStepX: function() {
            return 1 / this.width(1);
        }.onChange('htmlImage'),

        scaleStepY: function() {
            return 1 / this.height(1);
        }.onChange('htmlImage'),


        apply: function(ctx, source, options, callback) {
            if (!callback) {
                return;
            }

            options = options || {};
            var self = this;

            var img = source;
            if (source instanceof Design) {
                if (source.get('localHtmlImage')) {
                    img = source.get('localHtmlImage')
                } else {
                    callback(new Error('No localHtmlImage'));
                }
            }


            flow()
                .seq('maskimg', function(cb) {
                    self.initImage(cb);
                })
                .seq(function() {
                    self.combine(ctx, this.vars.maskimg, img, ctx.canvas.width, ctx.canvas.height, options);
                })
                .exec(callback);

        },

        combine: function(ctx, mask, img, width, height, options) {

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var oldCompositionOperation = ctx.globalCompositeOperation;

            ctx.drawImage(mask, this.$.offset.$.x, this.$.offset.$.y, this.width(), this.height());
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(img, 0, 0, width, height);

            ctx.globalCompositeOperation = oldCompositionOperation;
        },

        compose: function() {
            var offset = this.$.offset;
            var scale = this.$.scale;
            return {
                id: this.$.id,
                'offset': {
                    x: offset.$.x,
                    y: offset.$.y
                },
                'scale': {
                    x: scale.$.x,
                    y: scale.$.y
                },
                'fixedAspectRatio': this.$.fixedAspectRatio
            };
        },

        id: function() {
            var baseId = this.callBase();
            return [baseId, this.$.offset.$.x, this.$.offset.$.y, this.$.scale.$.x, this.$.scale.$.y].join('#');
        }
    });
});