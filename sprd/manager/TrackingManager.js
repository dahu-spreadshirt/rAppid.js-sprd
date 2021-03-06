define(["js/core/Component"], function (Component) {

    return Component.inherit("sprd.manager.TrackingManager", {
        defaults: {
            appName: ""
        },
        ctor: function () {
            this.$uniqueId = (new Date()).getTime();
            this.callBase();
        },

        trackUploadDesignCreationFailed: function (err) {
            var google = this.$.google;
            google && google.trackEvent("Upload", "DesignCreationFailed", this.get(err, "xhr.responses.text"));
        },

        trackUploadFailed: function (err) {
            var google = this.$.google;
            google && google.trackEvent("Upload", "Failed", (err || "").toString());
        },

        trackUploadSuccess: function () {
            var google = this.$.google;
            google && google.trackEvent("Upload", "Success");
        },
        trackShareToOmniture: function (shareBy) {
            var omniture = this.$.omniture;
            omniture && omniture.track(null, {
                eVar36: "sb" + this.generateOmnitureShareString(shareBy) + "_shared"
            }, null);
        },
        generateOmnitureShareString: function (shareBy) {
            var browser = "O",// other
                device = "O",
                timestamp = ~~(new Date().getTime() / 1000);

            return [timestamp, this.$.appName, browser, device, shareBy].join("_");
        }
    }, {
        ShareBy: {
            Mail: "ES",
            Facebook: "FS",
            Twitter: "TS",
            Pinterest: "PS",
            GooglePlus: "GS",
            WhatsApp: "WS",
            Link: "LS"
        }
    });
})
;