define(['sprd/data/SprdModel', 'sprd/entity/Address', 'underscore', 'sprd/entity/Person'], function (SprdModel, AddressEntity, _, Person) {

    /**
     * User Address shares the same interface and methods like Address but with some extensions
     *
     */
    var defaults = _.extend({
        shippingAddress: true,
        billingAddress: true,
        defaultBillingAddress: false,
        defaultShippingAddress: false
    }, AddressEntity.prototype.defaults);

    var schema = _.extend({
        shippingAddress: Boolean,
        billingAddress: Boolean,
        defaultBillingAddress: Boolean,
        defaultShippingAddress: Boolean
    }, AddressEntity.prototype.schema);

    var UserAddress = SprdModel.inherit('sprd.model.UserAddress', {
        defaults: defaults,
        schema: schema,
        validators: AddressEntity.prototype.validators,
        transformers: AddressEntity.prototype.transformers,
        parse: AddressEntity.prototype.parse,
        compose: AddressEntity.prototype.compose,
        _commitChangedAttributes: AddressEntity.prototype._commitChangedAttributes,
        isPackStation: AddressEntity.prototype.isPackStation,
        needsCounty: AddressEntity.prototype.needsCounty,
        needsZipCode: AddressEntity.prototype.needsZipCode,
        isStateRequired: AddressEntity.prototype.isStateRequired,
        hasStates: AddressEntity.prototype.hasStates,
        isCompany: AddressEntity.prototype.isCompany,
        _commitType: function (type) {
            this.set('billingAddress', type != AddressEntity.ADDRESS_TYPES.PACKSTATION);
        },
        _commitVatId: AddressEntity.prototype._commitVatId,
        _commitCountry: AddressEntity.prototype._commitCountry,
        _commitPersonSalutation: AddressEntity.prototype._commitPersonSalutation,
        supportsPackStation: AddressEntity.prototype.supportsPackStation,
        needsVatId: AddressEntity.prototype.needsVatId
    });

    UserAddress.ADDRESS_TYPES = AddressEntity.ADDRESS_TYPES;

    return UserAddress;
});