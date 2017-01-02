define(["sprd/model/Mask"], function(Mask) {

    return Mask.inherit("sketchomat.model.PixelMask", {

        defaults: {
            image: null
        },

        initImage: function(callback) {
            if (!this.get('image')) {
                callback && callback(null, null);
            }

            if (this.get('htmlImage')) {
                callback && callback(null, this.get('htmlImage'));
            }

            var self = this;

            var img = new Image();

            img.onload = function() {
                self.set('htmlImage', img);
                callback && callback(null, img);
            };

            img.onerror = function(e) {
                callback && callback(e);
            };

            img.src = this.get('image');
        },

        previewUrl: function() {
            var url = this.callBase();
            return url || this.$.image;
        }.onChange('image', 'preview')
    });
});