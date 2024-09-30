sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
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
      oData.deleteButtonText="Delete"

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

  
    _saveChanges: function (oData) {
      // Get the original model
      var oJsonModel = this.getView().getModel("jsonModel");

      // Update the original model's data using the stored context path
      oJsonModel.setProperty(this._originalContextPath, oData);

      // You can implement backend save logic here if necessary
      // Example: Sending the updated data to the backend
      console.log("Saving changes:", oData);

      // Close the dialog after saving
      this.onCloseDDDataNewDialog();
    },








  });
});