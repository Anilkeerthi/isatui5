sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
     "sap/m/MessageBox"
  ], (Controller, MessageToast,JSONModel,MessageBox) => {
    "use strict";
  
    return Controller.extend("com.isat.isatui5.controller.Tables.TaskNotes", {
  
        onInit: function () {
          var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

        },

        //open a NEW Dialog
        onTaskNotesNew: function () {
        
        this.byId("TaskNotesDialogNew").open();
      },
  
       // Close the NEW dialog 
       onCloseTaskNotesDialogNew: function () {
        this.byId("TaskNotesDialogNew").close();
        this.onClearTaskNotesDialogNew();
        this._refreshTable();
      },
  
       //Clear the all fields of NEW Dialog
       onClearTaskNotesDialogNew: function () {
        this.byId("TaskNotesName").setValue("");
        this.byId("TaskNotesno").setValue("");
        this.byId("TaskDialogNewComboBox").setValue("");
  
      },
  
      //refresh the DDData table
      _refreshTable: function () {
        var oTable = this.byId("idTaskNotes");
        var oBinding = oTable.getBinding("items");
  
        if (oBinding) {
  
          oBinding.refresh();
        }
      },

      //Creating a Tasks data by opening NEW Dialog
      onSaveTaskNotesDialogNew: function () {

      var sName = this.byId("TaskNotesName").getValue();
      var sNote = this.byId("TaskNotesno").getValue();
      var sTask_autoId = this.byId("TaskDialogNewComboBox").getSelectedKey();
     
      // Check for missing fields
      if (!sName && !sNote && !sTask_autoId) {
        MessageToast.show("All Fields are mandatory.");
        return;
      } else if (!sName) {
        MessageToast.show("Name is mandatory.");
        return;
      } else if (!sNote) {
        MessageToast.show(" Notes is mandatory.");
        return;
      }
      else if (!sTask_autoId) {
        MessageToast.show("Task Name is mandatory.");
        return;
      }

      // Ensure addType_id is handled as a proper integer
      sTask_autoId = sTask_autoId.replace(/,/g, '');  // Remove any commas if present
      sTask_autoId = Number(sTask_autoId);  // Convert to a plain integer

     

      // Get the OData model
      let oModel = this.getView().getModel();

      // Bind the list (Assuming you're binding to "/DDData" entity set)
      let oBindList = oModel.bindList("/TaskNotes");

      // Create the new entry using the bindList create method
      oBindList.create({
        task_id : {"autoid":sTask_autoId},
        notes : sNote,
        name : sName
      }
      );
      // Close the dialog after saving
      this.onCloseTaskNotesDialogNew();
    },

    //To perform edit, delete operation by opening ACTIONS Dailog
    onShowTasksNotes: function (oEvent) {
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
      this.byId("TaskNotesDialog").open();
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

     //to close the actions dialog box
     onCloseTaskNotesDialog: function () {
      this.byId("TaskNotesDialog").close();
    },


    // Delete functionality for ACTIONS DialogBox
    onDeleteTaskNotesDialog: function () {
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
            let oBindList = oModel.bindList("/TaskNotes");
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
            that.onCloseTaskNotesDialog();
          }
        }
      });
    },


    //Save functionality
    _saveChanges: function (oData) {
      var that = this;
      let itemID = oData.autoid;

      let oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/TaskNotes");

      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

  

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
        // Set the new property value
        aContexts[0].setProperty("task_id/autoid", oData.task_id.autoid);
        aContexts[0].setProperty("notes", oData.notes);
        aContexts[0].setProperty("name",  oData.name);

          // Submit the changes for OData V4
          oModel.submitBatch("myBatchGroup").then(function () {
            MessageToast.show("Changes saved successfully!");
            that._refreshTable();  // Trigger the table refresh after successful save
          }).catch(function () {
            MessageToast.show("Error saving changes.");
          });
        }
      });

      this.onCloseTaskNotesDialog();
    },








  
       
       
      
    });
  });