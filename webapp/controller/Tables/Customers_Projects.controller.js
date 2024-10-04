sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
  "use strict";

  return Controller.extend("com.isat.isatui5.controller.Tables.Customers_Projects", {

    onInit: function () {
      var oDataModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oDataModel, "jsonModel")
      console.log(oDataModel)

    },

    //open a NEW Dialog
    onCustomer_ProjectNew: function () {
      // Reset the ComboBoxes
      this.byId("CustomersDialogNewComboBox").setSelectedKey("");
      this.byId("ProjectsDialogNewComboBox").setSelectedKey("");
      this.byId("Customers_ProjectsDialogNew").open();
    },

     // Close the NEW dialog 
     onCloseCustomers_ProjectsDialogNew: function () {
      this.byId("Customers_ProjectsDialogNew").close();
      this.onClearaveCustomers_ProjectsDialogNew();
      this._refreshTable();
    },

     //Clear the all fields of NEW Dialog
     onClearaveCustomers_ProjectsDialogNew: function () {
      this.byId("CustomersDialogNewComboBox").setValue("");
      this.byId("ProjectsDialogNewComboBox").setValue("");

    },

    //refresh the DDData table
    _refreshTable: function () {
      var oTable = this.byId("idCustomers_Projects");
      var oBinding = oTable.getBinding("items");

      if (oBinding) {

        oBinding.refresh();
      }
    },

     //Creating a Tasks data by opening NEW Dialog
     onSaveCustomers_ProjectsDialogNew: function () {

      var sCustomer_id = this.byId("CustomersDialogNewComboBox").getSelectedKey();
      var sProj_id = this.byId("ProjectsDialogNewComboBox").getSelectedKey();


      // Check for missing fields
      if (!sCustomer_id && !sProj_id) {
        MessageToast.show("Both Fields are mandatory.");
        return;
      } else if (!sCustomer_id) {
        MessageToast.show("Customer Name is mandatory.");
        return;
      } else if (!sProj_id) {
        MessageToast.show("Project Name is mandatory.");
        return;
      }

      // Ensure addType_id is handled as a proper integer
      sCustomer_id = sCustomer_id.replace(/,/g, '');  // Remove any commas if present
      sCustomer_id = Number(sCustomer_id);  // Convert to a plain integer

      sProj_id = sProj_id.replace(/,/g, '');  // Remove any commas if present
      sProj_id = Number(sProj_id);  // Convert to a plain integer

      // Get the OData model
      let oModel = this.getView().getModel();

      // Bind the list (Assuming you're binding to "/DDData" entity set)
      let oBindList = oModel.bindList("/Customers_Projects");

      // Create the new entry using the bindList create method
      oBindList.create({
        customer_id: { "autoid": sCustomer_id },
        proj_id: { "autoid": sProj_id }
      }
      );
      // Close the dialog after saving
      this.onCloseCustomers_ProjectsDialogNew();
    },

    




  });
});