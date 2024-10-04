sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast,MessageBox, JSONModel) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Interface_Details", {

    onInit: function () {
      var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

    },

    onShowDetails: function (oEvent) {
      // Get the selected row's data
      var oSelectedItem = oEvent.getSource().getParent();
      var oContext = oSelectedItem.getBindingContext("jsonModel");
      var oData = oContext.getObject();

      // Store the context path to update the original model later
      this._originalContextPath = oContext.getPath();
      oData.editable = false;
      oData.buttonText = "Edit";
      oData.deleteButtonText = "Delete"

      // Create a new JSON model to bind the dialog content
      var oDialogModel = new sap.ui.model.json.JSONModel();
      oDialogModel.setData(oData);
      this.getView().setModel(oDialogModel, "dialogModel");

      // Open the dialog
      this.byId("Interface_DetailsDialog").open();
    },

    // Toggle Buttons in DialogBox
    onToggleEdit: function () {
      // Get the dialog model
      var oDialogModel = this.getView().getModel("dialogModel");
      var oData = oDialogModel.getData();

      // Toggle the 'editable' property and button texts
      if (oData.editable) {
        // Currently in edit mode, save changes
        oData.editable = false;
        oData.buttonText = "Edit";          // Change Save to Edit
        oData.deleteButtonText = "Delete";  // Reset to Delete
        // Save the changes to the backend and update the original model
        this._saveChanges(oData);
      } else {
        // Enable edit mode
        oData.editable = true;
        oData.buttonText = "Save";           // Change Edit to Save
        oData.deleteButtonText = "Cancel";   // Change Delete to Cancel
      }

      oDialogModel.setData(oData);
    },

    // Delete functionality in DialogBox
    onDeletePress: function () {
      // Get the dialog model
      var oDialogModel = this.getView().getModel("dialogModel");
      var oData = oDialogModel.getData();

      // Check if the delete button is pressed and currently showing 'Delete'
      if (oData.deleteButtonText === "Delete") {
        // Call the delete function and pass the unique ID
        this._deleteInterface_Details(oData.autoid);
      } else {
        // Cancel the edit mode
        oData.editable = false;
        oData.buttonText = "Edit";           // Reset Save to Edit
        oData.deleteButtonText = "Delete";   // Reset Cancel to Delete
        oDialogModel.setData(oData);
      }
    },
    //Save functionality
    _saveChanges: function (oData) {
      var that = this;
      let itemID = oData.autoid;

      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/InterfaceDetails");

      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("name", oData.name);
          aContexts[0].setProperty("description", oData.description);
          aContexts[0].setProperty("module", oData.module);
          aContexts[0].setProperty("package", oData.package);
          aContexts[0].setProperty("senderssystem", oData.senderssystem);
          aContexts[0].setProperty("receiversystem", oData.receiversystem);
          aContexts[0].setProperty("process", oData.process);
          aContexts[0].setProperty("sourceadapter", oData.sourceadapter);
          aContexts[0].setProperty("targetadapter", oData.targetadapter);
          aContexts[0].setProperty("techpoc", oData.techpoc);
          aContexts[0].setProperty("functionalpoc", oData.functionalpoc);
          aContexts[0].setProperty("businesspoc", oData.businesspoc);
          aContexts[0].setProperty("doctype", oData.doctype);
          aContexts[0].setProperty("frequency", oData.frequency);
          aContexts[0].setProperty("ccenabled", oData.ccenabled);

          // Submit the changes for OData V4
          oModel.submitBatch("myBatchGroup").then(function () {
            MessageToast.show("Changes saved successfully!");
            that._refreshTable();  // Trigger the table refresh after successful save
          }).catch(function () {
            MessageToast.show("Error saving changes.");
          });
        }
      });

      this.onCloseDialogAction();
    },
    onCloseDialogAction: function () {
      this.byId("Interface_DetailsDialog").close();
    },

    // Refresh table functionality
    _refreshTable: function () {
      var oTable = this.byId("idInterface_Details");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {
        oBinding.refresh();
      }
    },
    //Add the delete function
    _deleteInterface_Details: function (autoid) {
      var oModel = this.getView().getModel();
      var that = this;

      // Confirmation dialog to ask the user before deleting
      MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.YES) {
            // OData V4 Binding list
            let oBindList = oModel.bindList("/InterfaceDetails");
            // Create a filter based on the unique autoid field
            let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, autoid);

            // Request the list of items based on the filter
            oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
              if (aContexts && aContexts.length > 0) {
                // Perform the delete on the first context
                aContexts[0].delete().then(function () {
                  // Show success message
                  MessageToast.show("Item deleted successfully.");
                  // Optionally, refresh the table
                  that._refreshTable();
                }).catch(function (oError) {
                  // Error handling
                  MessageBox.error("Error deleting the item: " + oError.message);
                });
              }
            });

            // Close the dialog after deletion
            that.onCloseDialogAction();
          }
        }
      });
    },

    //Creating a New Customer Data
    onInterface_DetailsNew: function () {
      // Open the dialog
      this.byId("Interface_DetailsDialogNew").open();
    },

    onSaveInterface_DetailsNew: function () {
      var sName = this.byId("Interface_DetailsName").getValue();
      var sDescription = this.byId("Interface_DetailsDescription").getValue();
      var sModule = this.byId("Interface_DetailsModule").getValue();
      var sPackage = this.byId("Interface_DetailsPackage").getValue();
      var sSendersSystem = this.byId("Interface_DetailsSendersSystem").getValue();
      var sReceiverSystem = this.byId("Interface_DetailsReceiverSystem").getValue();
      var sProcess = this.byId("Interface_DetailsProcess").getValue();
      var sSourceAdapter = this.byId("Interface_DetailsSourceAdapter").getValue();
      var sTargetAdapter = this.byId("Interface_DetailsTargetAdapter").getValue();
      var sTechPOC = this.byId("Interface_DetailsTechPOC").getValue();
      var sFunctionalPOC = this.byId("Interface_DetailsFunctionalPOC").getValue();
      var sBusinessPOC = this.byId("Interface_DetailsBusinessPOC").getValue();
      var sDoctype = this.byId("Interface_DetailsDoctype").getValue();
      var sFrequency = this.byId("Interface_DetailsFrequency").getValue();
      var sCCEnabled = this.byId("Interface_DetailsCCEnabled").getValue();

      if (!sName && !sDescription && !sModule && !sPackage && !sSendersSystem && !sReceiverSystem && !sProcess && !sSourceAdapter && !sTargetAdapter && !sTechPOC && !sFunctionalPOC && !sBusinessPOC && !sDoctype && !sFrequency && !sCCEnabled) {
        sap.m.MessageToast.show("All fields are mandatory.");
        return;
      } else if (!sName) {
        sap.m.MessageToast.show("Name is mandatory.");
        return;
      } else if (!sDescription) {
        sap.m.MessageToast.show("Description is mandatory.");
        return;
      } else if (!sModule) {
        sap.m.MessageToast.show("Module is mandatory.");
        return;
      } else if (!sPackage) {
        sap.m.MessageToast.show("Package is mandatory.");
        return;
      } else if (!sSendersSystem) {
        sap.m.MessageToast.show("SendersSystem is mandatory.");
        return;
      }else if (!sReceiverSystem) {
        sap.m.MessageToast.show("ReceiverSystem is mandatory.");
        return;
      } else if (!sProcess) {
        sap.m.MessageToast.show("Process is mandatory.");
        return;
      } else if (!sSourceAdapter) {
        sap.m.MessageToast.show("SourceAdapter is mandatory.");
        return;
      } else if (!sTargetAdapter) {
        sap.m.MessageToast.show("TargetAdapter is mandatory.");
        return;
      } else if (!sTechPOC) {
        sap.m.MessageToast.show("TechPOC is mandatory.");
        return;
      }else if (!sFunctionalPOC) {
        sap.m.MessageToast.show("FunctionalPOC is mandatory.");
        return;
      } else if (!sBusinessPOC) {
        sap.m.MessageToast.show("BusinessPOC is mandatory.");
        return;
      } else if (!sDoctype) {
        sap.m.MessageToast.show("Doctype is mandatory.");
        return;
      } else if (!sFrequency) {
        sap.m.MessageToast.show("Frequency is mandatory.");
        return;
      } else if (!sCCEnabled) {
        sap.m.MessageToast.show("CCEnabled is mandatory.");
        return;
      }



      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Comments");

      oBindList.create({
        refid: sRefID,
        type: sType,
        comment: sComments,
        created_by: sCreatedBy,
        created_datetime: sCreatedDatetime
      });

      // Close the dialog after saving
      this.onCloseDialog();


    },

    onClearDialog: function () {
      // Clear the input fields after saving
      this.byId("Interface_DetailsName").setValue("");
      this.byId("Interface_DetailsDescription").setValue("");
      this.byId("Interface_DetailsModule").setValue("");
      this.byId("Interface_DetailsPackage").setValue("");
      this.byId("Interface_DetailsSendersSystem").setValue("");

      this.byId("Interface_DetailsReceiverSystem").setValue("");
      this.byId("Interface_DetailsProcess").setValue("");
      this.byId("Interface_DetailsSourceAdapter").setValue("");
      this.byId("Interface_DetailsTargetAdapter").setValue("");
      this.byId("Interface_DetailsTechPOC").setValue("");

      this.byId("Interface_DetailsFunctionalPOC").setValue("");
      this.byId("Interface_DetailsBusinessPOC").setValue("");
      this.byId("Interface_DetailsDoctype").setValue("");
      this.byId("Interface_DetailsFrequency").setValue("");
      this.byId("Interface_DetailsCCEnabled").setValue("");
    },



    onCloseDialog: function () {
      // Close the dialog
      this.byId("Interface_DetailsDialogNew").close();

      // Clear the input fields after saving 
      this.onClearDialog();

      //call the refresh function
      this._refreshTable();
    },



  });
});