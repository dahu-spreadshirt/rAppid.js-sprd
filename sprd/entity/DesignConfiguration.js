define(['sprd/entity/Configuration', 'sprd/entity/Size', 'sprd/util/UnitUtil', 'sprd/model/Design', "sprd/entity/PrintTypeColor", "underscore"], function (Configuration, Size, UnitUtil, Design, PrintTypeColor, _) {
    return Configuration.inherit('sprd.model.DesignConfiguration', {

        schema: {
            type: String,
            content: Object,
            designs: Object,
            restrictions: Object
        },

        defaults: {
            type: 'design',
            _dpi: "{printType.dpi}",

            design: null
        },

        ctor: function () {
            this.$sizeCache = {};
            this.callBase();

            var printType = this.$.printType,
                design = this.$.design;

            // set print colors
            var printColors = [];
            var defaultPrintColors = [];


            design.$.colors.each(function (designColor) {
                var closestPrintColor = printType.getClosestPrintColor(designColor.$["default"]);
                printColors.push(closestPrintColor);
                defaultPrintColors.push(closestPrintColor);
            });

            this.$defaultPrintColors = defaultPrintColors;

            this.$.printColors.reset(printColors);
            this.$hasDefaultColors = true;

        },


        hasDefaultColors: function () {
            return this.$hasDefaultColors;
        },

        getPrintColorsAsRGB: function () {
            var ret = [];

            // go in the direction of the layers of the design

            for (var i = 0; i < this.$.design.$.colors.$items.length; i++) {
                var designColor = this.$.design.$.colors.$items[i];
                var printColor = this.$.printColors.$items[i];
                ret[designColor.$.layer] = printColor.color().toRGB().toHexString();
            }

            return ret;
        },

        setColor: function (layerIndex, color) {
            var printType = this.$.printType;

            if (!(color instanceof PrintTypeColor)) {
                color = printType.getClosestPrintColor(color);
            }

            if (!printType.containsPrintTypeColor(color)) {
                throw new Error("Color not contained in print type");
            }

            var printColors = this.$.printColors.$items;
            printColors.splice(layerIndex, 1, color);

            this.$hasDefaultColors = _.isEqual(printColors, this.$defaultPrintColors);

            this.$.printColors.reset(printColors);
        },

        size: function () {

            if (this.$.design && this.$.printType && this.$.printType.$.dpi) {
                var dpi = this.$.printType.$.dpi;
                if (!this.$sizeCache[dpi]) {
                    this.$sizeCache[dpi] = UnitUtil.convertSizeToMm(this.$.design.$.size, dpi);
                }

                return this.$sizeCache[dpi];
            }

            return Size.empty;
        }.onChange("_dpi", "design"),

        compose: function () {
            var ret = this.callBase();

            var transform = [],
                scale = this.$.scale,
                rotation = this.$.rotation,

                width = this.width(),
                height = this.height();

            if (rotation) {
                transform.push("rotate(" + rotation + "," + Math.round(width / 2, 3) + "," + Math.round(height / 2, 3) + ")");
            }

            if (scale && (scale.x < 0 || scale.y < 0)) {
                transform.push("scale(" + (scale.x < 0 ? -1 : 1) + "," + (scale.y < 0 ? -1 : 1) + ")");
            }

            var designId = this.$.design.$.wtfMbsId;
            ret.content = {
                unit: "mm",
                dpi: "25.4",
                svg: {
                    image: {
                        transform: transform.join(" "),
                        width: Math.round(width, 3),
                        height: Math.round(height, 3),
                        designId: designId
                    }
                }
            };

            var printColorIds = [],
                printColorRGBs = [];

            this.$.printColors.each(function (printColor) {
                printColorIds.push(printColor.$.id);
                printColorRGBs.push(printColor.color().toString())
            });

            if (this.$.printType.isPrintColorColorSpace()) {
                ret.content.svg.image.printColorIds = printColorIds.join(" ");
            } else {
                ret.content.svg.image.printColorRGBs = printColorRGBs.join(" ");
            }

            ret.restrictions = {
                changeable: true
            };

            return ret;
        },

        // TODO: add onchange for design.restriction.allowScale
        isScalable: function () {
            return this.get("printType.isScalable()") && this.get("design.restrictions.allowScale");
        }.onChange("printType")
    });
});