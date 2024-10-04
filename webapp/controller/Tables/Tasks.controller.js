sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], (Controller, MessageToast, JSONModel,MessageBox) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Tasks", {

    onInit: function () {
      var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

    },

    //open a NEW Dialog
    onDDTasksNew: function () {
      this.byId("TasksDialogNew").open();
    },

    // Close the NEW dialog 
    onCloseTasksDialogNew: function () {
      this.byId("TasksDialogNew").close();
      this.onClearTasksDialogNew();
      this._refreshTable();
    },

    //Clear the all fields of NEW Dialog
    onClearTasksDialogNew: function () {
      this.byId("Tasksassignedto").setValue("");
      this.byId("Taskscreated_by").setValue("");
      this.byId("Taskscreated_datetime").setValue("");
      this.byId("Tasksduration").setValue("");
      this.byId("Tasksenddate").setValue("");
      this.byId("Tasksparent_task_id").setValue("");
      this.byId("Tasksstartdate").setValue("");
      this.byId("Tasksstatus").setValue("");
      this.byId("Taskstask_name").setValue("");
      this.byId("TasksDialogNewComboBox").setValue("");
      this.byId("Taskstype").setValue("");
      this.byId("Tasksupdated_by").setValue("");
      this.byId("Tasksupdated_datetime").setValue("");
    },

    //refresh the DDData table
    _refreshTable: function () {
      var oTable = this.byId("idTasks");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {

        oBinding.refresh();
      }
    },

    //Creating a Tasks data by opening NEW Dialog
    onSaveTasksDialogNew: function () {
      var sAssignedto = this.byId("Tasksassignedto").getValue();
      var sTaskscreated_by = this.byId("Taskscreated_by").getValue();
      var sTaskscreated_datetime = this.byId("Taskscreated_datetime").getValue();
      var sTasksduration = this.byId("Tasksduration").getValue();
      var sTasksenddate = this.byId("Tasksenddate").getValue();
      var sTasksparent_task_id = this.byId("Tasksparent_task_id").getValue();
      var sTasksstartdate = this.byId("Tasksstartdate").getValue();
      var sTasksstatus = this.byId("Tasksstatus").getValue();
      var sTaskstask_name = this.byId("Taskstask_name").getValue();
      var tasklist_autoid = this.byId("TasksDialogNewComboBox").getSelectedKey();
      var sTaskstype = this.byId("Taskstype").getValue();
      var sTasksupdated_by = this.byId("Tasksupdated_by").getValue();
      var sTasksupdated_datetime = this.byId("Tasksupdated_datetime").getValue();


      if (!sAssignedto && !sTaskscreated_by && !sTaskscreated_datetime && !sTasksduration && !sTasksenddate &&
        !sTasksparent_task_id && !sTasksstartdate && !sTasksstatus && !sTaskstask_name && !tasklist_autoid &&
        !sTaskstype && !sTasksupdated_by && !sTasksupdated_datetime) {
        MessageToast.show("All Fields are mandatory.");
        return;
      } else if (!sAssignedto) {
        MessageToast.show("Assigned to is mandatory.");
        return;
      } else if (!sTaskscreated_by) {
        MessageToast.show("Created by is mandatory.");
        return;
      } else if (!sTaskscreated_datetime) {
        MessageToast.show("Created date/time is mandatory.");
        return;
      } else if (!sTasksduration) {
        MessageToast.show("Duration is mandatory.");
        return;
      } else if (!sTasksenddate) {
        MessageToast.show("End date is mandatory.");
        return;
      } else if (!sTasksparent_task_id) {
        MessageToast.show("Parent task ID is mandatory.");
        return;
      } else if (!sTasksstartdate) {
        MessageToast.show("Start date is mandatory.");
        return;
      } else if (!sTasksstatus) {
        MessageToast.show("Status is mandatory.");
        return;
      } else if (!sTaskstask_name) {
        MessageToast.show("Task name is mandatory.");
        return;
      } else if (!tasklist_autoid) {
        MessageToast.show("Task list is mandatory.");
        return;
      } else if (!sTaskstype) {
        MessageToast.show("Task type is mandatory.");
        return;
      } else if (!sTasksupdated_by) {
        MessageToast.show("Updated by is mandatory.");
        return;
      } else if (!sTasksupdated_datetime) {
        MessageToast.show("Updated date/time is mandatory.");
        return;
      }


      // Ensure addType_id is handled as a proper integer
      tasklist_autoid = tasklist_autoid.replace(/,/g, '');  // Remove any commas if present
      tasklist_autoid = Number(tasklist_autoid);  // Convert to a plain integer


      // Get the OData model
      let oModel = this.getView().getModel();

      // Bind the list (Assuming you're binding to "/DDData" entity set)
      let oBindList = oModel.bindList("/Tasks");

      // Create the new entry using the bindList create method
      oBindList.create({
        task_name : sTaskstask_name,
        duration : sTasksduration,
        startdate: sTasksstartdate,
        enddate : sTasksenddate,
        status : sTasksstatus,
        type : sTaskstype,
        parent_task_id : sTasksparent_task_id,
        assignedto : sAssignedto,
        created_by: sTaskscreated_by,
        updated_datetime: sTasksupdated_datetime,
        created_datetime : sTaskscreated_datetime,
        updated_by: sTasksupdated_by,
        tasklist_id : { "autoid": tasklist_autoid }
      
      }
      );
      // Close the dialog after saving
      this.onCloseTasksDialogNew();
    },

  //To perform edit, delete operation by opening ACTIONS Dailog
  onShowDetailsTasks: function (oEvent) {
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
    this.byId("TasksDialog").open();
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
      let oBindList = oModel.bindList("/Tasks");

     // let DDType_autoId=oData.ddType_id.autoid;

       // Ensure addType_id is handled as a proper integer
      // DDType_autoId = DDType_autoId.replace(/,/g, '');  // Remove any commas if present
      // DDType_autoId = Number(DDType_autoId);  // Convert to a plain integer


      let aFilter = new sap.ui.model.Filter("autoid", sap.ui.model.FilterOperator.EQ, itemID);

      // Filter and request contexts (rows) to update data
      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts && aContexts.length > 0) {
          // Set the new property values
          aContexts[0].setProperty("task_name", oData.task_name);
          aContexts[0].setProperty("duration", oData.duration);
          aContexts[0].setProperty("startdate", oData.startdate);

          aContexts[0].setProperty("enddate", oData.enddate);
          aContexts[0].setProperty("status", oData.status);
          aContexts[0].setProperty("type", oData.type);

          aContexts[0].setProperty("parent_task_id", oData.parent_task_id);
          aContexts[0].setProperty("assignedto", oData.assignedto);
          aContexts[0].setProperty("created_by", oData.created_by);

          aContexts[0].setProperty("updated_datetime", oData.updated_datetime);
          aContexts[0].setProperty("created_datetime", oData.created_datetime);
          aContexts[0].setProperty("updated_by", oData.updated_by);

        //  aContexts[0].setProperty("tasklist_id/autoid", oData.ddType_id.autoid);

          // Submit the changes for OData V4
          oModel.submitBatch("myBatchGroup").then(function () {
            MessageToast.show("Changes saved successfully!");
            that._refreshTable();  // Trigger the table refresh after successful save
          }).catch(function () {
            MessageToast.show("Error saving changes.");
          });
        }
      });

      this.onCloseTasksDialog();

    },

    //to close the actions dialog box
    onCloseTasksDialog: function () {
      this.byId("TasksDialog").close();
    },

     // Delete functionality for ACTIONS DialogBox
     onDeleteTasksDialog: function () {
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
            let oBindList = oModel.bindList("/Tasks");
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
            that.onCloseTasksDialog();
          }
        }
      });
    },









  });
});