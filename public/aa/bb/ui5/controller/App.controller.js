sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("goodmorning.goodmorning.controller.App", {

		onInit: function() {
			var oConfig = this.getOwnerComponent().getManifestEntry("/sap.ui5/config");
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				modelData: oConfig.D_conn
            });
			sap.ui.getCore().setModel(oModel, "scrmodel");
		}

    });

});