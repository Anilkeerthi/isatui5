sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], (Controller, MessageToast, JSONModel,MessageBox) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.DDData", {

    onInit: function () {

      var odataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(odataModel, "jsonModel")
      console.log(odataModel)

    },

    //open a NEW Dialog
    onDDDataNew: function () {
      this.byId("DDDataDialogNew").open();
    },

    // Close the NEW dialog 
    onCloseDDDataNewDialog: function () {
      this.byId("DDDataDialogNew").close();
      this.onClearNewDialog();
      this._refreshTable();
    },

    //Creating a DDData by opening NEW Dialog
    onSaveDDDataNew: function () {
      var sName = this.byId("DDDataName").getValue();
      var sValue = this.byId("DDDataValue").getValue();
      var addType_id = this.byId("DDTypeNameComboBox").getSelectedKey();

      if (!sName && !sValue && !addType_id) {
        MessageToast.show("All Fields are mandatory.");
        return;
      } else if (!sName) {
        MessageToast.show("Name is mandatory.");
        return;
      } else if (!sValue) {
        MessageToast.show("Value is mandatory.");
        return;
      }
      else if (!addType_id) {
        MessageToast.show("DDType name is mandatory.");
        return;
      }

      // Ensure addType_id is handled as a proper integer
      addType_id = addType_id.replace(/,/g, '');  // Remove any commas if present
      addType_id = Number(addType_id);  // Convert to a plain integer


      // Get the OData model
      let oModel = this.getView().getModel();

      // Bind the list (Assuming you're binding to "/DDData" entity set)
      let oBindList = oModel.bindList("/DDData");

      // Create the new entry using the bindList create method
      oBindList.create({
        name: sName,
        value: sValue,
        ddType_id: {
          "autoid": addType_id  // autoid should now be a valid integer
        }
      }
      );
      // Close the dialog after saving
      this.onCloseDDDataNewDialog();
    },

    //Clear the all fields of NEW Dialog
    onClearNewDialog: function () {
      this.byId("DDDataName").setValue("");
      this.byId("DDDataValue").setValue("");
      this.byId("DDTypeNameComboBox").setValue("");
    },

    //refresh the DDData table
    _refreshTable: function () {
      var oTable = this.byId("idDDData");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {

        oBinding.refresh();
      }
    },

    //To perform edit, delete operation by opening ACTIONS Dailog
    onShowDetailsOfDDData: function (oEvent) {
      // Get the selected row's data
      var oSelectedItem = oEvent.getSource().getParent();
      var oContext = oSelectedItem.getBindingContext("jsonModel");
      var oData = oContext.getObject();

      // Store the context path to update the original model later
      this._originalContextPath = oContext.getPath();

      // Add a new property 'editable' to control the edit mode
      oData.editable = false;
      oData.buttonText = "Edit"; // Button starts as 'Edit'
      oData.deleteButtonText = "Delete"

      // Create a new JSON model to bind the dialog content
      var oDialogModel = new sap.ui.model.json.JSONModel();
      oDialogModel.setData(oData);

      // Bind the dialog with the selected row data
      this.getView().setModel(oDialogModel, "dialogModel");

      // Open the dialog
      this.byId("DDDataDialog").open();
    },


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

      // Update the model
      oDialogModel.setData(oData);

      // Control visibility of the Input and ComboBox
      var oInput = this.byId("DDTypeNameInput");
      var oComboBox = this.byId("DDTypeNameComboBoxx");
      oInput.setVisible(!oData.editable);
      oComboBox.setVisible(oData.editable);
    },

    //update function for ACTIONS Dialog
    _saveChanges: function (oData) {
      var that = this;
      let itemID = oData.autoid;


      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/DDData");

      let DDType_autoId=oData.ddType_id.autoid;

       // Ensure addType_id is handled as a proper integer
      // DDType_autoId = DDType_autoId.replace(/,/g, '');  // Remove any commas if present
       DDType_autoId = Number(DDType_autoId);  // Convert to a plain integer


      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("autoid", oData.autoid);
          aContexts[0].setProperty("name", oData.name);
          aContexts[0].setProperty("value", oData.value);
          aContexts[0].setProperty("ddType_id",{
            "autoid": addType_id 
          });

          // Submit the changes for OData V4
          oModel.submitBatch("myBatchGroup").then(function () {
            MessageToast.show("Changes saved successfully!");
            that._refreshTable();  // Trigger the table refresh after successful save
          }).catch(function () {
            MessageToast.show("Error saving changes.");
          });
        }
      });

      this.onCloseDialogDDDataActions();

    },


    
  

    //to close the actions dialog box
    onCloseDialogDDDataActions: function () {
      this.byId("DDDataDialog").close();
    },

    // Delete functionality for ACTIONS DialogBox
    onDeletePress: function () {
      // Get the dialog model
      var oDialogModel = this.getView().getModel("dialogModel");
      var oData = oDialogModel.getData();

      // Check if the delete button is pressed and currently showing 'Delete'
      if (oData.deleteButtonText === "Delete") {
        // Call the delete function and pass the unique ID
        this._deleteDDType(oData.autoid);
      } else {
        // Cancel the edit mode
        oData.editable = false;
        oData.buttonText = "Edit";           // Reset Save to Edit
        oData.deleteButtonText = "Delete";   // Reset Cancel to Delete
        oDialogModel.setData(oData);
      }
    },

    //Add the delete function for ACTIONS Dialog
    _deleteDDType: function (autoid) {
      var oModel = this.getView().getModel();
      var that = this;

      // Confirmation dialog to ask the user before deleting
      MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.YES) {
            // OData V4 Binding list
            let oBindList = oModel.bindList("/DDData");
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
            that.onCloseDialogDDDataActions();
          }
        }
      });
    },

  });
});