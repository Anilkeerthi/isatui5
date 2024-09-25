sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/Fragment",
      "sap/m/MessageToast",
      "sap/m/Dialog",
      "sap/m/Button",
      "sap/m/Text",
      "sap/ui/layout/form/SimpleForm",
      "sap/m/Label",
      "sap/m/Input",
    ],
    function (Controller,Fragment, MessageToast,Dialog, Button, Text, SimpleForm, Label, Input) {
      "use strict";
  
      return Controller.extend("com.isat.isatui5.controller.AdminScreen", {
        onInit: function () {
  
          var Model = this.getOwnerComponent().getModel("CustomerData");
          this.getView().setModel(Model, "jsonModel")
          console.log(Model)
                
    },
  
        //Routing back to dashBoard
        backToDashBoard: function () {
          var route = this.getOwnerComponent().getRouter();
          route.navTo("RouteDashboard")
        },
  
      onEntityChange: function(oEvent) {
        var selectedKey = oEvent.getSource().getSelectedKey();
        var oVBox = this.byId("tablePlaceholder");
    
        // Get the reference of embedded Customer View
        var oCustomerView = this.byId("CustomerView");
        var oUsersView = this.byId("UsersView");
    
        // Hide all child views initially
        oVBox.getItems().forEach(function(oItem) {
            oItem.setVisible(false);
        });
    
        // Show the appropriate view based on the selected key
        if (selectedKey === "CustomersData") {
            // Show Customer view
            oCustomerView.setVisible(true);
        } 
  
        if (selectedKey === "Users") {
          // Show Customer view
          oUsersView.setVisible(true);
      } 
        // Handle other keys accordingly
    },
    
  
        //NEW Button Fragment(DialogBox)
        onAdminButtonPress: function () {
          if (!this.oChangeDialog) {
            this.oChangeDialog = this.loadFragment({
              name: "com.isat.isatui5.view.AdminScreen"
            });
          }
  
  
          this.oChangeDialog.then(function (oDialog) {
            this.oDialog = oDialog;
  
            this.oDialog.open();
          }.bind(this));
        },
  
  
  
      });
    }
  );
  