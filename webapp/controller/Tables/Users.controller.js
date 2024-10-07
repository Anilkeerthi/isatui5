sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, JSONModel) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Users", {

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
      this.byId("usersDialog").open();
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

        oData.active = (oData.active === 'true' || oData.active === true);

        // Save the activechanges to the backend and update the original model
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
        this._deleteUsers(oData.autoid);
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
  let oBindList = oModel.bindList("/Users");
 
  let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);
 
  oData.active = (oData.active === 'true' || oData.active === true);
 
  // Filter and request contexts (rows) to update data
  oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
    if (aContexts && aContexts.length > 0) {
      // Set the new property values
      aContexts[0].setProperty("userid", oData.userid);
      aContexts[0].setProperty("name", oData.name);
      aContexts[0].setProperty("custid", oData.custid);
      aContexts[0].setProperty("role", oData.role);
      aContexts[0].setProperty("emailid", oData.emailid);
      aContexts[0].setProperty("active", oData.active);
 
 
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
      this.byId("usersDialog").close();
    },
    // Refresh table functionality
    _refreshTable: function () {
      var oTable = this.byId("idUsers");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {
        oBinding.refresh();
      }
    },
    //Add the delete function
    _deleteUsers: function (autoid) {
      var oModel = this.getView().getModel();
      var that = this;

      // Confirmation dialog to ask the user before deleting
      MessageBox.confirm("Are you sure you want to delete this item?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.YES) {
            // OData V4 Binding list
            let oBindList = oModel.bindList("/Users");
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
    onUsersNew: function () {
      // Open the dialog
      this.byId("usersDialogNew").open();
    },

    onSaveUsersNew: function () {
      var sCustomerID = this.byId("usersCustomerID").getValue();
      var sName = this.byId("usersName").getValue();
      var sEmailID = this.byId("usersEmailID").getValue();
      var sRole = this.byId("usersRole").getValue();
      var sUserID = this.byId("usersUserID").getValue();
      var sActive = this.byId("usersActive").getValue();

      if (!sCustomerID && !sName && !sEmailID && !sRole && !sUserID && !sActive) {
        sap.m.MessageToast.show("All fields are mandatory.");
        return;
      } else if (!sCustomerID) {
        sap.m.MessageToast.show("CustomerID is mandatory.");
        return;
      } else if (!sName) {
        sap.m.MessageToast.show("Name is mandatory.");
        return;
      } else if (!sEmailID) {
        sap.m.MessageToast.show("EmailID is mandatory.");
        return;
      }
      else if (!sRole) {
        sap.m.MessageToast.show("Role is mandatory.");
        return;
      }
      else if (!sUserID) {
        sap.m.MessageToast.show("UserID is mandatory.");
        return;
      }
      else if (!sActive) {
        sap.m.MessageToast.show("Active is mandatory.");
        return;
      }

      var bActive = (sActive === 'true');

      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Users");

      oBindList.create({
        name: sName,
        userid: sUserID,
        role: sRole,
        active: bActive,
        emailid: sEmailID,
        custid: sCustomerID
      });

      // Close the dialog after saving
      this.onCloseDialog();


    },

    onClearDialog: function () {
      // Clear the input fields after saving
      this.byId("usersCustomerID").setValue("");
      this.byId("usersName").setValue("");
      this.byId("usersEmailID").setValue("");
      this.byId("usersRole").setValue("");
      this.byId("usersUserID").setValue("");
      this.byId("usersActive").setValue("");
    },



    onCloseDialog: function () {
      // Close the dialog
      this.byId("usersDialogNew").close();

      // Clear the input fields after saving 
      this.onClearDialog();

      //call the refresh function
      this._refreshTable();
    },







  });
});