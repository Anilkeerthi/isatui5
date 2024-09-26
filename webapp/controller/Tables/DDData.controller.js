sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
  ], (Controller, MessageToast,JSONModel) => {
    "use strict";
  
    return Controller.extend("com.isat.isatui5.controller.Tables.DDData", {
  
        onInit: function () {
          
          var odataModel = this.getOwnerComponent().getModel();
          this.getView().setModel(odataModel, "jsonModel")
          console.log(odataModel)
           
        },
  
        onShowDetails: function (oEvent) {
          // Get the selected row's data
          var oSelectedItem = oEvent.getSource().getParent();
          var oContext = oSelectedItem.getBindingContext("jsonModel");
          var oData = oContext.getObject();
         
          // Store the context path to update the original model later
          this._originalContextPath = oContext.getPath();
     
          // Add a new property 'editable' to control the edit mode
          oData.editable = false;
          oData.buttonText = "Edit"; // Button starts as 'Edit'
     
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
     
          // Toggle the 'editable' property and button text
          if (oData.editable) {
              // Currently in edit mode, save changes
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
          // Get the original model
          var oJsonModel = this.getView().getModel("jsonModel");
     
          // Update the original model's data using the stored context path
          oJsonModel.setProperty(this._originalContextPath, oData);
     
          // You can implement backend save logic here if necessary
          // Example: Sending the updated data to the backend
          console.log("Saving changes:", oData);
     
          // Close the dialog after saving
          this.onCloseDialog();
      },
     
      onCloseDialog: function () {
          // Close the dialog
          this.byId("DDDataDialog").close();
      },
       
      
    });
  });