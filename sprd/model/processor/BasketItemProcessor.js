define(['sprd/model/processor/DefaultProcessor', 'sprd/model/Shop', 'sprd/model/Article', 'sprd/model/Product'], function (DefaultProcessor, Shop, Article, Product) {

    var TYPE_PRODUCT = "sprd:product",
        TYPE_ARTICLE = "sprd:article";

    return DefaultProcessor.inherit("sprd.model.processor.BasketItemProcessor", {

        parse: function (model, payload, action, options) {
            var element = payload.element,
                properties = element.properties,
                prop,
                elementPayload = {};

            for (var i = 0; i < properties.length; i++) {
                prop = properties[i];
                if (prop.key === "size" || prop.key === "appearance") {
                    if (!elementPayload[prop.key]) {
                        elementPayload[prop.key] = {};
                    }
                    elementPayload[prop.key]["id"] = prop.value
                }
                if (prop.key === "sizeLabel") {
                    if (!elementPayload["size"]) {
                        elementPayload["size"] = {};
                    }
                    elementPayload["size"]["name"] = prop.value;
                }
                if (prop.key === "appearanceLabel") {
                    if (!elementPayload["appearance"]) {
                        elementPayload["appearance"] = {};
                    }
                    elementPayload["appearance"]["name"] = prop.value;
                }

            }

            var shop = this.$dataSource.createEntity(Shop, payload.shop.id);

            if (element.type === TYPE_ARTICLE) {
                elementPayload.item = this.$dataSource.getContextForChild(Article, shop).createEntity(Article, element.id);
            } else if (element.type === TYPE_PRODUCT) {
                elementPayload.item = this.$dataSource.getContextForChild(Product, shop).createEntity(Product, element.id);
            } else {
                throw "Element type '" + element.type + "' not supported";
            }
            elementPayload.item.set('price', payload.price);


            payload['element'] = elementPayload;

            return this.callBase(model, payload, action, options);
        },

        compose: function (model) {
            var payload = this.callBase();

            var element = payload.element;
            var elementPayload = {};
            var properties = elementPayload['properties'] = [
                {key: "appearance", value: element.appearance.id},
                {key: "size", value: element.size.id}
            ];

            var baseArticleId = model.get("element.article.id");

            if (baseArticleId) {
                properties.push({
                    key: "article",
                    value: baseArticleId
                });
            }

            var links = [];

            var continueShoppingLink = model.get("element.continueShoppingLink");

            if (continueShoppingLink) {
                links.push({
                    type: "continueShopping",
                    href: continueShoppingLink
                });
            }

            var editLink = model.get("element.editLink");
            if (editLink) {
                links.push({
                    type: "edit",
                    href: editLink
                });
            }




            if (links.length > 0) {
                elementPayload['links'] = links;
            }

            elementPayload["type"] = model.$.element.getType();
            elementPayload["href"] = model.get('element.item.href');
            elementPayload["id"] = model.get('element.item.id');

            var ret = {
                element: elementPayload,
                quantity: payload.quantity
            };

            if (payload.origin) {
                ret['origin'] = payload.origin;
            }

            return ret;
        }
    });
});