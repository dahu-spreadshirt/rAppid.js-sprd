define(['js/data/Entity', 'js/type/Color'], function (Entity, Color) {
    return Entity.inherit('sprd.entity.DesignColor', {
        schema: {
            "default": String,
            origin: String,
            layer: String
        },

        parse: function (data) {
            data = this.callBase();
            data["default"] = Color.parse(data["default"]);
            data.origin = Color.parse(data.origin);
            return data;
        },

        compose: function () {
            var color = this.callBase();

            color.default = color.default.toString();
            color.origin = color.origin.toString();

            return color;
        }
    })
});