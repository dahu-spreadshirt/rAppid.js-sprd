define(["sprd/data/SprdModel"], function (SprdModel) {
    return SprdModel.inherit("sprd.data.Article",{
        price: function() {
            // TODO format price with currency
            return this.$.price.vatIncluded;
        }
    });
});
