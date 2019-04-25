/*eslint-disable no-console, no-alert, sap-no-hardcoded-color */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, MessageBox, MessageToast) {
    "use strict";

    var busyDialog = (busyDialog) ? busyDialog : new sap.m.BusyDialog({});

    return Controller.extend("goodmorning.goodmorning.controller.ContactPersons", {

        onInit: function() {
            var oView = this.getView();
            var this_ = this;

            this.getView().addEventDelegate({
                onBeforeShow: function(evt) {
                    this_.wasteTime();

                    var oModel = new sap.ui.model.json.JSONModel();
        
                    this_.refreshEtag();

                    var oModel = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", false);
                    oModel.read("/ContactPersons", {
                        success: function(oData) {
                            this_.runNext();
                            var oJSModel = new sap.ui.model.json.JSONModel(oData);

                            var oTable = this_.byId("persons");

                            if (oJSModel.getData() !== null) {
                                oView.setModel(oJSModel);

                                for (var i = 0; i < oJSModel.getData().results.length; i++) {
                                    var oItem = oTable.getItems()[i];
                                    var oCells = oItem.getCells();

                                    for (var j = 0; j < oCells.length; j++) {
                                        oCells[j].setEditable(true);
                                        oCells[j].setValueState("None");
                                    }
                                }

                            } else {
                                var cap = [];
                                cap = {
                                    "results": {}
                                };
                                cap["results"] = [];

                                oJSModel.setProperty("/", cap);

                                oView.setModel(oJSModel);
                            }
                            this_.onButtonBehaviour();
                        },
                        error: function(e) {
                            this_.runNext();
                            console.log(e);
                        }
                    });
                }
            });

        },

        wasteTime: function() {
            busyDialog.open();
        },

        runNext: function() {
            busyDialog.close();
        },

        onButtonBehaviour: function() {
            var oTable = this.getView().byId("persons");
            var oTableLength = oTable.getItems().length;
            if (oTableLength === 0) {
                var InsertButton = this.getView().byId("InsertButton");
                InsertButton.setEnabled(true);
                var SaveButton = this.getView().byId("SaveButton");
                SaveButton.setEnabled(true);
                var EditButton = this.getView().byId("EditButton");
                EditButton.setEnabled(false);
                var DeleteButton = this.getView().byId("DeleteButton");
                DeleteButton.setEnabled(false);
            } else {
                var InsertButton = this.getView().byId("InsertButton");
                InsertButton.setEnabled(true);
                var SaveButton = this.getView().byId("SaveButton");
                SaveButton.setEnabled(true);
                var EditButton = this.getView().byId("EditButton");
                EditButton.setEnabled(true);
                var DeleteButton = this.getView().byId("DeleteButton");
                DeleteButton.setEnabled(true);
            }
        },

        onInsert: function(oEvent) {
            var this_ = this;

            var SaveButton = this.getView().byId("SaveButton");
            SaveButton.setEnabled(true);
            var EditButton = this.getView().byId("EditButton");
            EditButton.setEnabled(true);
            var DeleteButton = this.getView().byId("DeleteButton");
            DeleteButton.setEnabled(true);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel = this.getView().getModel();

            var jsondata = {
                "ID": "",
                "FIRSTNAME": "",
                "LASTNAME": ""
            };

            var aNewRecord = oModel.getProperty("/results");
            aNewRecord.push(jsondata);
            oModel.setProperty("/results", aNewRecord);

            this.getView().setModel(oModel);

            jQuery.sap.delayedCall(100, null, function() {
                var oLength = oModel.getData().results.length;
                var oTable = this_.byId("persons");
                var oItem = oTable.getItems()[oLength - 1];
                var oCells = oItem.getCells();

                for (var j = 0; j < oCells.length; j++) {
                    oCells[j].setEditable(true);
                }
            });
        },

        onEdit: function(oEvent) {
            var oTable = this.byId("persons");

            var oSelectedItem = oTable.getSelectedItem();
            if (oSelectedItem !== null) {
                var oCells = oSelectedItem.getCells();
                for (var j = 0; j < oCells.length; j++) {
                    oCells[j].setEditable(true);
                }
            }
        },

        onDelete: function(oEvent) {
            var oTable = this.byId("persons");

            var oSelectedItem = oTable.getSelectedItem();
            if (oSelectedItem === null) {
                MessageBox.alert(this.getView().getModel("i18n").getResourceBundle().getText("WARNING_MSG1"), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                });
            } else {
                var that = this;
                MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("WARNING_MSG2"), {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Delete",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function(oEvent_) {
                        that.fnCallbackConfirm(oEvent_, oTable, oSelectedItem);
                    }
                });
            }
        },

        fnCallbackConfirm: function(oEvent, oTable, oItem) {
            if (oEvent === "YES") {
                var oIndex = oTable.indexOfItem(oItem);

                var oModel = new sap.ui.model.json.JSONModel();
                oModel = this.getView().getModel();

                var oData = oModel.getData().results;
                oData.splice(oIndex, 1);
                oModel.setProperty("/results", oData);
                this.getView().setModel(oModel);

                oTable.removeSelections(true);
                this.onButtonBehaviour();
                return true;
            } else {
                oTable.removeSelections(true);
                this.onButtonBehaviour();
                return false;
            }
        },

        onSave: async function(oEvent) {
            var this_ = this;

            var oTable = this.byId("persons");
            var oModel = new sap.ui.model.json.JSONModel();
            oModel = this.getView().getModel();

            var oLength = oModel.getData().results.length;

            var error = 0;

            for (var i = 0; i < oLength; i++) {
                var oItem = oTable.getItems()[i];
                var oCells = oItem.getCells();
                for (var j = 0; j < oCells.length; j++) {
                    oCells[j].setEditable(false);

                    if (j === 0 || j === 1) {
                        if (oCells[j].getValue() === "") {
                            error = 1;
                            oCells[j].setValueState("Error");
                            oCells[j].setEditable(true);
                            oCells[j].setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("ERROR_MSG3"));
                        }
                    }
                }
            }

            if (error === 0) {
                var oData = oModel.getData().results;

                oTable = this_.byId("persons");
                for (i = 0; i < oLength; i++) {
                    oItem = oTable.getItems()[i];
                    oCells = oItem.getCells();

                    for (j = 0; j < oCells.length; j++) {
                        oCells[j].setEditable(false);
                        oCells[j].setValueState("None");
                    }
                }

                var oJsonData = JSON.stringify(oData);
                console.log(oJsonData);

                var oldETag = sap.ui.getCore().getModel("sETag").oData.modelData;
                var newETag = await this.getEtag();

                if (newETag === oldETag) {
                    this_.onWrite(oJsonData);
                } else {
                    if (oldETag !== newETag) {
                        sap.m.MessageBox.show(jQuery.sap.resources({
                            url: "i18n/i18n.properties"
                        }).getText("ERROR_MSG2"), {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: this_.getView().getModel("i18n").getResourceBundle().getText("WELCOME_TITLE"),
                            actions: ["Overwrite", "Refresh"],
                            onClose: function(oAction) {
                                if (oAction === "Overwrite") {
                                    this_.onWrite(oJsonData);
                                } else {
                                    this_.refreshEtag();
                                    var oModel_ = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", false);
                                    oModel_.read("/ContactPersons", {
                                        success: function(oData) {
                                            var oJSModel = new sap.ui.model.json.JSONModel(oData);

                                            var oTable = this_.byId("persons");

                                            if (oJSModel.getData() !== null) {
                                                this_.getView().setModel(oJSModel);

                                                for (var i = 0; i < oJSModel.getData().results.length; i++) {
                                                    var oItem = oTable.getItems()[i];
                                                    var oCells = oItem.getCells();

                                                    for (var j = 0; j < oCells.length; j++) {
                                                        oCells[j].setEditable(true);
                                                        oCells[j].setValueState("None");
                                                    }
                                                }
                                            } else {
                                                var cap = [];
                                                cap = {
                                                    "results": {}
                                                };
                                                cap["results"] = [];

                                                oJSModel.setProperty("/", cap);

                                                this_.getView().setModel(oJSModel);
                                            }
                                            this_.onButtonBehaviour();
                                        },
                                        error: function(e) {
                                            console.log(e);
                                            jQuery.sap.require("sap.m.MessageBox");
                                            sap.m.MessageBox.show(jQuery.sap.resources({
                                                url: "i18n/i18n.properties"
                                            }).getText("ERROR_MSG1"), {
                                                icon: sap.m.MessageBox.Icon.INFORMATION,
                                                title: this_.getView().getModel("i18n").getResourceBundle().getText("WELCOME_TITLE"),
                                                actions: sap.m.MessageBox.Action.OK,
                                                onClose: null
                                                //styleClass: ""                        
                                            });
                                        }
                                    });
                                }
                            }.bind(this)
                            //styleClass: ""                        
                        });
                    }
                }
            } else {
                jQuery.sap.require("sap.m.MessageBox");
                sap.m.MessageBox.show(jQuery.sap.resources({
                    url: "i18n/i18n.properties"
                }).getText("ERROR_MSG1"), {
                    icon: sap.m.MessageBox.Icon.INFORMATION,
                    title: this_.getView().getModel("i18n").getResourceBundle().getText("WELCOME_TITLE"),
                    actions: sap.m.MessageBox.Action.OK,
                    onClose: null
                    //styleClass: ""                        
                });
            }
        },

        getEtag: function() {
            return new Promise(function(resolve, reject) {
                var oDataModel = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", true);
                var etag = "";
                oDataModel.read("/ContactPersons", null, null, true, function(oData, response) {
                    if (oData.results.length > 0) {
                        for(var i=0; i < oData.results.length; i++) {
                            console.log(oData.results[i].__metadata.etag);
                            etag += hex_md5(oData.results[i].__metadata.etag);
                        }
                    }
                    console.log(etag);
                    resolve(etag);
                });
            });
        },

        refreshEtag: function() {
            var sETagModel = new sap.ui.model.json.JSONModel();
            var oDataModel = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", true);
            var modelDataval;
            var etag = "";
            oDataModel.read("/ContactPersons", null, null, true, function(oData, response) {
                if (oData.results.length > 0) {
                    for(var i=0; i < oData.results.length; i++) {
                        etag += hex_md5(oData.results[i].__metadata.etag);
                    }
                    modelDataval = etag;
                }
                else
                    modelDataval = "";

                sETagModel.setData({
                    modelData: modelDataval
                });
                sap.ui.getCore().setModel(sETagModel, "sETag");
            });
        },

        onWrite: function(oJsonData) {
            var this_ = this;

            oJsonData = JSON.parse(oJsonData);
            console.log(oJsonData);

            this.wasteTime();
            if (oJsonData.length > 0) {
    			var oParams = {};
    			oParams.json = true;
    			oParams.defaultUpdateMethod = "PUT";
    			oParams.useBatch = true;
    
    			var batchModel = new sap.ui.model.odata.v2.ODataModel("../lib/xsodata/goodmorning.xsodata", oParams);
    			var mParams = {};
    			mParams.groupId = "1001";
    			mParams.success = function() {
    			    this_.refreshEtag();
    			    var oModel_ = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", false);
                    oModel_.read("/ContactPersons", {
                        success: function(oData) {
                            this_.runNext();
                            var oJSModel = new sap.ui.model.json.JSONModel(oData);

                            var oTable = this_.byId("persons");

                            if (oJSModel.getData() !== null) {
                                this_.getView().setModel(oJSModel);
                            } else {
                                var cap = [];
                                cap = {
                                    "results": {}
                                };
                                cap["results"] = [];

                                oJSModel.setProperty("/", cap);

                                this_.getView().setModel(oJSModel);
                            }
                        },
                        error: function(e) {
                            this_.runNext();
                            console.log(e);
                        }
                    });

    				sap.m.MessageToast.show("Record has been updated");
    			};
    			mParams.error = this.onErrorCall;
    
    			for (var k = 0; k < oJsonData.length; k++) {
    			    if(oJsonData[k].ID === "")
    			        oJsonData[k].ID = 0;
    				batchModel.create("/AddEditPersons", oJsonData[k], mParams);
    			}
                
            } else {

                var oEntry = {};
                oEntry.ID = 0;
                oEntry.FIRSTNAME = "";
                oEntry.LASTNAME = "";

                var oDataModel = new sap.ui.model.odata.ODataModel("../lib/xsodata/goodmorning.xsodata", true);
                oDataModel.create("/DeletePersons", oEntry, {
                    context: null,
                    success: function(data) {
                        this_.runNext();
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.show(jQuery.sap.resources({
                            url: "i18n/i18n.properties"
                        }).getText("EDIT_SUCCESS_MSG"), {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: this_.getView().getModel("i18n").getResourceBundle().getText("WELCOME_TITLE"),
                            actions: sap.m.MessageBox.Action.OK,
                            onClose: function(oAction) {
                               
                            }
                            //styleClass: ""                        
                        });
                    },
                    error: function(e) {
                        console.log(e);
                        this_.runNext();
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.show(jQuery.sap.resources({
                            url: "i18n/i18n.properties"
                        }).getText("EDIT_ERROR_MSG"), {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: this_.getView().getModel("i18n").getResourceBundle().getText("WELCOME_TITLE"),
                            actions: sap.m.MessageBox.Action.OK,
                            onClose: function(oAction) {
                                
                            }
                            //styleClass: ""                        
                        });
                    }
                });
            }
        },

    });
});