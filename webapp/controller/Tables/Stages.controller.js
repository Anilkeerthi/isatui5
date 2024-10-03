sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
  ], (Controller, MessageToast,MessageBox,JSONModel) => {
    "use strict";
  
    return Controller.extend("com.isat.isatui5.controller.Tables.Stages", {
  
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
          this.byId("StagesDialog").open();
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
        this._deleteStages(oData.autoid);
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
  let oBindList = oModel.bindList("/Stages");

  let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

  // Filter and request contexts (rows) to update data
  oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
    if (aContexts && aContexts.length > 0) {
      // Set the new property values
      aContexts[0].setProperty("autoid", oData.autoid);
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

  this.onCloseDialogAction();
},
onCloseDialogAction: function () {
  this.byId("StagesDialog").close();
},

// Refresh table functionality
_refreshTable: function () {
  var oTable = this.byId("idStages");
  var oBinding = oTable.getBinding("items");

  if (oBinding) {
    oBinding.refresh();
  }
},
  //Add the delete function
  _deleteStages: function (autoid) {
    var oModel = this.getView().getModel();
    var that = this;

    // Confirmation dialog to ask the user before deleting
    MessageBox.confirm("Are you sure you want to delete this item?", {
      actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      onClose: function (oAction) {
        if (oAction === MessageBox.Action.YES) {
          // OData V4 Binding list
          let oBindList = oModel.bindList("/Stages");
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
  onStagesNew: function () {
    // Open the dialog
    this.byId("StagesDialogNew").open();
  },

  onSaveStagesNew: function () {
    var sName = this.byId("StagesName").getValue();
    var sDescription = this.byId("StagesDescription").getValue();
     

    if (!sName && !sDescription) {
      sap.m.MessageToast.show("All fields are mandatory.");
      return;
    } else if (!sName) {
      sap.m.MessageToast.show("Name is mandatory.");
      return;
    } else if (!sDescription) {
      sap.m.MessageToast.show("Description is mandatory.");
      return;
    } 



    let oModel = this.getView().getModel();
    let oBindList = oModel.bindList("/Stages");

    oBindList.create({
      name: sName,
      description: sDescription,
    
    });

    // Close the dialog after saving
    this.onCloseDialog();


  },

  onClearDialog: function () {
    // Clear the input fields after saving
    this.byId("StagesName").setValue("");
    this.byId("StagesDescription").setValue("");
   
  },



  onCloseDialog: function () {
    // Close the dialog
    this.byId("StagesDialogNew").close();
    
    // Clear the input fields after saving 
    this.onClearDialog();

    //call the refresh function
    this._refreshTable();
  },

      
    });
  });