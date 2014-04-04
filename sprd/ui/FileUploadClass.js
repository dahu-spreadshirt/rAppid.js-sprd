define(['js/ui/FileUpload', 'sprd/data/IframeUpload'], function(FileUpload, IframeUpload) {

    return FileUpload.inherit('sprd.ui.FileUploadClass', {

        _initializationComplete: function () {
            var iframe,
                iframeContent,
                self = this,
                stageDocument = this.$stage.$document;

            if (!window.FileReader) {
                iframe = this.$templates.iframe.createInstance();

                iframe.bind('on:load', function initIframe (e) {
                    var iframeInput,
                        iframeDocument = e.target.$el.contentDocument,
                        iframeBody = iframeDocument.getElementsByTagName('body')[0];

                    iframeContent = self.$templates.iframeContent.createInstance();

                    self.$stage.$document = iframeDocument;
                    iframeBody.appendChild(iframeContent.render());
                    self.$stage.$document = stageDocument;

                    iframeInput = self.$.iframeInput;

                    iframeInput.bind('on:change', function () {
                        self.trigger('on:change', { iframeUpload: new IframeUpload(self) } );
                    });

                    self.bind('on:click', function (ev) {
                        self.$.iframeInput.$el.click();
                        ev.preventDefault();
                    });
                });

                this.$stage.addChild(iframe);
            }
        }
    });
});