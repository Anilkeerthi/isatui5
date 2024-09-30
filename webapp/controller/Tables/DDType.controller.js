sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast,MessageBox,JSONModel) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.DDType", {

    onInit: function () {

      var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

    },

    // Dialog box for Action functionality

    onShowDetails: function (oEvent) {
      // Get the selected row's data
      var oSelectedItem = oEvent.getSource().getParent();
      var oContext = oSelectedItem.getBindingContext("jsonModel");
      var oData = oContext.getObject();

      // Store the context path to update the original model later
      this._originalContextPath = oContext.getPath();
      oData.editable = false;
      oData.buttonText = "Edit"; 

      // Create a new JSON model to bind the dialog content
      var oDialogModel = new sap.ui.model.json.JSONModel();
      oDialogModel.setData(oData);
      this.getView().setModel(oDialogModel, "dialogModel");

      // Open the dialog
      this.byId("DDTypeDialog").open();
    },

    onToggleEdit: function () {
      // Get the dialog model
      var oDialogModel = this.getView().getModel("dialogModel");
      var oData = oDialogModel.getData();

  
      if (oData.editable) {
        oData.editable = false;
        oData.buttonText = "Edit";

        // Save the changes to the backend and update the original model
        this._saveChanges(oData);
      } else {
        // Enable edit mode
        oData.editable = true;
        oData.buttonText = "Save";

       
      }

      // Update the model
      oDialogModel.setData(oData);
    },

    _saveChanges: function (oData) {
      var that = this;
      let itemID = oData.autoid;
  
      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/DDType");
  
      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);
  
      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
          if (aContexts && aContexts.length > 0) {
              // Set the new property values
              aContexts[0].setProperty("description", oData.description);
              aContexts[0].setProperty("name", oData.name);
  
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
    this.byId("DDTypeDialog").close();
},

_refreshTable: function () {
    var oTable = this.byId("idDDtype");  
    var oBinding = oTable.getBinding("items");

    if (oBinding) {
        
        oBinding.refresh(); 
    }
},


    //Creating a New DDType Data
    onDDTypeNew: function () {
      // Open the dialog
      this.byId("DDTypeDialogNew").open();
    },

    onSaveDDTypeNew: function () {
      var sName = this.byId("DDTypeName").getValue();
      var sDescription = this.byId("DDTypeDescription").getValue();

      if (!sName && !sDescription) {
        sap.m.MessageToast.show("Both Name and Description are mandatory.");
        return;
      } else if (!sName) {
        sap.m.MessageToast.show("Name is mandatory.");
        return;
      } else if (!sDescription) {
        sap.m.MessageToast.show("Description is mandatory.");
        return;
      }


      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/DDType");

      oBindList.create({
        name: sName,
        description: sDescription
      });

      // Close the dialog after saving
      this.onCloseDialog();


    },

    onClearDialog: function () {
      // Clear the input fields after saving
      this.byId("DDTypeName").setValue("");
      this.byId("DDTypeDescription").setValue("");
    },



    onCloseDialog: function () {
      // Close the dialog
      this.byId("DDTypeDialogNew").close();
      
      // Clear the input fields after saving 
      this.onClearDialog();

      //call the refresh function
      this._refreshTable();
    },

     //Delete the DDType

  onDeleteDDType: function (oEvent) {
    var oTable = this.byId("idDDtype");
    var oItem = oEvent.getSource().getParent(); // Get the button's parent (ColumnListItem)

    // Get the binding context to fetch the data
    var oContext = oItem.oPropagatedProperties.oBindingContexts.jsonModel; // Get the binding context of the selected row
    var sPath = oItem.oPropagatedProperties.oBindingContexts.jsonModel.sPath
   
    // Retrieve the autoId from the context
    var oData = oItem.oPropagatedProperties.oBindingContexts.jsonModel.getObject();
    var sAutoId = oData.autoid; // Assuming the field name is 'autoId'

    // Confirmation before deletion
    MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
            if (oAction === MessageBox.Action.YES) {
                // Call the delete function on the binding context for OData V4
                oContext.delete().then(function () {
                    MessageToast.show("Item deleted successfully.");
                    // Refresh the table to reflect changes
                    oTable.getBinding("items").refresh();
                }).catch(function (oError) {
                    MessageBox.error("Error deleting the item: " + oError.message);
                });
            }
        }.bind(this) // Make sure the correct 'this' context is maintained
    });
}


  });
});