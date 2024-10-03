sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
  ], (Controller, MessageToast,MessageBox,JSONModel) => {
    "use strict";
  
    return Controller.extend("com.isat.isatui5.controller.Tables.Projects", {
  
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
          this.byId("ProjectsDialog").open();
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

         // Convert status to Boolean (assuming it could be 'true' or 'false' as strings)
         oData.status = (oData.status === 'true' || oData.status === true); 

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
        this._deleteProjects(oData.autoid);
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
      let oBindList = oModel.bindList("/Projects");

      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Convert status to Boolean again if necessary
    oData.status = (oData.status === 'true' || oData.status === true);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("description", oData.description);
          aContexts[0].setProperty("name", oData.name);
          aContexts[0].setProperty("projid", oData.projid);
          aContexts[0].setProperty("status", oData.status);

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
      this.byId("ProjectsDialog").close();
    },
  
        // Refresh table functionality
    _refreshTable: function () {
      var oTable = this.byId("idProjects");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {
        oBinding.refresh();
      }
    },

    //Add the delete function
    _deleteProjects: function (autoid) {
      var oModel = this.getView().getModel();
      var that = this;

      // Confirmation dialog to ask the user before deleting
      MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.YES) {
            // OData V4 Binding list
            let oBindList = oModel.bindList("/Projects");
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
     onProjectsNew: function () {
      // Open the dialog
      this.byId("ProjectsDialogNew").open();
    },

    onSaveProjectsNew: function () {
      var sName = this.byId("ProjectsName").getValue();
      var sDescription = this.byId("ProjectsDescription").getValue();
      var sProjectID = this.byId("ProjectsProjectID").getValue();
      var sStatus = this.byId("ProjectsStatus").getValue();

      if (!sName && !sDescription && !sProjectID && !sStatus) {
        sap.m.MessageToast.show("All fields are mandatory.");
        return;
      } else if (!sName) {
        sap.m.MessageToast.show("Name is mandatory.");
        return;
      } else if (!sDescription) {
        sap.m.MessageToast.show("Description is mandatory.");
        return;
      } else if (!sProjectID) {
        sap.m.MessageToast.show("ProjectID is mandatory.");
        return;
      } else if (!sStatus) {
        sap.m.MessageToast.show("Status is mandatory.");
        return;
      }

      var bStatus = (sStatus === 'true');
  

      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Projects");

      oBindList.create({
        name: sName,
        description: sDescription,
        projid:sProjectID,
        status:bStatus
      });

      // Close the dialog after saving
      this.onCloseDialog();


    },

    onClearDialog: function () {
      // Clear the input fields after saving
      this.byId("ProjectsName").setValue("");
      this.byId("ProjectsDescription").setValue("");
      this.byId("ProjectsProjectID").setValue("");
      this.byId("ProjectsStatus").setValue("");
    },



    onCloseDialog: function () {
      // Close the dialog
      this.byId("ProjectsDialogNew").close();
      
      // Clear the input fields after saving 
      this.onClearDialog();

      //call the refresh function
      this._refreshTable();
    },

       
      
    });
  });