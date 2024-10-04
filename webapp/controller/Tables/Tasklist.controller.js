sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], (Controller, MessageToast, JSONModel,MessageBox) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Tasklist", {

    onInit: function () {
      var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

    },

    //open a NEW Dialog
    onTaskListNew: function () {
      this.byId("TasklistDialogNew").open();
    },

    // Close the NEW dialog 
    onCloseTasklistDialogNew: function () {
      this.byId("TasklistDialogNew").close();
      this.onClearTasklistDialogNew();
      this._refreshTable();
    },

    //Clear the all fields of NEW Dialog
    onClearTasklistDialogNew: function () {
      this.byId("TasklistName").setValue("");
      this.byId("TasklistDescription").setValue("");
    },

    //refresh the Tasklist table
    _refreshTable: function () {
      var oTable = this.byId("idTasklist");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {

        oBinding.refresh();
      }
    },

    //Creating a Tasklist by opening NEW Dialog
    onSaveTasklistDialogNew: function () {
      var sName = this.byId("TasklistName").getValue();
      var sDesc = this.byId("TasklistDescription").getValue();

      if (!sName && !sDesc ) {
        MessageToast.show("All Fields are mandatory.");
        return;
      } else if (!sName) {
        MessageToast.show("Name is mandatory.");
        return;
      } else if (!sDesc) {
        MessageToast.show("Description is mandatory.");
        return;
      }

      // Get the OData model
      let oModel = this.getView().getModel();

      // Bind the list (Assuming you're binding to "/DDData" entity set)
      let oBindList = oModel.bindList("/Tasklist");

      // Create the new entry using the bindList create method
      oBindList.create({
        name: sName,
        description: sDesc
      }
      );
      // Close the dialog after saving
      this.onCloseTasklistDialogNew();
    },
    
     //To perform edit, delete operation by opening ACTIONS Dailog
     onShowDetailsOfTaskList: function (oEvent) {
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
      this.byId("TasklistDialog").open();
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


    },

    //update function for ACTIONS Dialog
    _saveChanges: function (oData) {
      var that = this;
      let itemID = oData.autoid;


      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Tasklist");

      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("name", oData.name);
          aContexts[0].setProperty("description", oData.description);
          

          // Submit the changes for OData V4
          oModel.submitBatch("myBatchGroup").then(function () {
            MessageToast.show("Changes saved successfully!");
            that._refreshTable();  // Trigger the table refresh after successful save
          }).catch(function () {
            MessageToast.show("Error saving changes.");
          });
        }
      });

      this.onCloseTasklistDialog();

    },


     //to close the actions dialog box
     onCloseTasklistDialog: function () {
      this.byId("TasklistDialog").close();
    },

    // Delete functionality for ACTIONS DialogBox
    onDeleteTasklistDialog: function () {
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
            let oBindList = oModel.bindList("/Tasklist");
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
            that.onCloseTasklistDialog();
          }
        }
      });
    }

  

  });
});