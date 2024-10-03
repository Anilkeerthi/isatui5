sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, JSONModel) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Customer", {
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
      this.byId("CustomersDialog").open();
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
        this._deleteCustomer(oData.autoid);
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
      let oBindList = oModel.bindList("/Customers");

      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("description", oData.description);
          aContexts[0].setProperty("name", oData.name);
          aContexts[0].setProperty("custid", oData.custid);
          aContexts[0].setProperty("location", oData.location);

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
      this.byId("CustomersDialog").close();
    },

    // Refresh table functionality
    _refreshTable: function () {
      var oTable = this.byId("idCustomer");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {
        oBinding.refresh();
      }
    },

    //Add the delete function
    _deleteCustomer: function (autoid) {
      var oModel = this.getView().getModel();
      var that = this;

      // Confirmation dialog to ask the user before deleting
      MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.YES) {
            // OData V4 Binding list
            let oBindList = oModel.bindList("/Customers");
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
    onCustomerNew: function () {
      // Open the dialog
      this.byId("onCommentsNew").open();
    },

    onSaveCustomerNew: function () {
      var sName = this.byId("CustomersName").getValue();
      var sDescription = this.byId("CustomersDescription").getValue();
      var sCustID = this.byId("CustomersCustID").getValue();
      var sLocation = this.byId("CustomersLocation").getValue();

      if (!sName && !sDescription && !sCustID && !sLocation) {
        sap.m.MessageToast.show("All fields are mandatory.");
        return;
      } else if (!sName) {
        sap.m.MessageToast.show("Name is mandatory.");
        return;
      } else if (!sDescription) {
        sap.m.MessageToast.show("Description is mandatory.");
        return;
      } else if (!sCustID) {
        sap.m.MessageToast.show("CustomerID is mandatory.");
        return;
      } else if (!sLocation) {
        sap.m.MessageToast.show("Location is mandatory.");
        return;
      }


      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Customers");

      oBindList.create({
        name: sName,
        description: sDescription,
        custid:sCustID,
        location:sLocation
      });

      // Close the dialog after saving
      this.onCloseDialog();


    },

    onClearDialog: function () {
      // Clear the input fields after saving
      this.byId("CustomersName").setValue("");
      this.byId("CustomersDescription").setValue("");
      this.byId("CustomersCustID").setValue("");
      this.byId("CustomersLocation").setValue("");
    },



    onCloseDialog: function () {
      // Close the dialog
      this.byId("CustomersDialogNew").close();
      
      // Clear the input fields after saving 
      this.onClearDialog();

      //call the refresh function
      this._refreshTable();
    },




  });
});