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
                
          var TModel = this.getOwnerComponent().getModel("TableNames");
          this.getView().setModel(TModel, "TableNames")
         
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

        var oProjectsView = this.byId("ProjectsView");

        // Get the reference of embedded DDData View
        var oDDDataView = this.byId("DDDataView");
        
        var oDDTypeView = this.byId("DDTypeView");

        var oComponent_TaskListView = this.byId("Component_TaskListView");

        var oCustomersProjectsView = this.byId("Customers_ProjectsView");

        var oTasklistView = this.byId("TasklistView");
    
        var oRolesView = this.byId("RolesView");

        var oInterfaceDetailsView = this.byId("Interface_DetailsView");

        var oTasksView = this.byId("TasksView");

        var oTeamsView = this.byId("TeamsView");
      
        var oStagesView = this.byId("StagesView");
      
        var oCommentsView = this.byId("CommentsView");

        var oTimeCaptureView = this.byId("TimeCaptureView");

        var oTeamsUsersView = this.byId("Teams_UsersView");

        var oComponentStagesView = this.byId("Component_StagesView");

        var oTaskNotesView = this.byId("TaskNotesView");

        var oTimeLinesView = this.byId("TimeLinesView");

        var oPhasesView = this.byId("PhasesView");

        var oUsersRolesView = this.byId("Users_RolesView");

        var oIssueView = this.byId("IssuesView");







        // Hide all child views initially
        oVBox.getItems().forEach(function(oItem) {
            oItem.setVisible(false);
        });
    
        // Show the appropriate view based on the selected key
        // if (selectedKey === "CustomersData") {
        //     // Show Customer view
        //     oCustomerView.setVisible(true);
        // } 
  
        // if (selectedKey === "UsersData") {
        //   // Show Customer view
        //   oUsersView.setVisible(true);
        // } 

// Show the appropriate view based on the selected key
switch (selectedKey) {
  case "CustomersData":
      // Show Customer view
      oCustomerView.setVisible(true);
      break;

  case "UsersData":
      // Show Users view
      oUsersView.setVisible(true);
      break;

      case "ProjectsData":
      // Show Users view
      oProjectsView.setVisible(true);
      break;

  case "ProjectsData":
      // Show Projects view
      oProjectsView.setVisible(true);
      break;

  case "DDTypeData":
      // Show DDType view
      oDDTypeView.setVisible(true);
      break;

  case "ComponentTaskListData":
      // Show Component Task List view
      oComponent_TaskListView.setVisible(true);
      break;

  case "CustomersProjectsData":
      // Show Customers Projects view
      oCustomersProjectsView.setVisible(true);
      break;

  case "TasklistData":
      // Show Tasklist view
      oTasklistView.setVisible(true);
      break;

  case "RolesData":
      // Show Roles view
      oRolesView.setVisible(true);
      break;

  case "InterfaceDetailsData":
      // Show Interface Details view
      oInterfaceDetailsView.setVisible(true);
      break;

  case "TasksData":
      // Show Tasks view
      oTasksView.setVisible(true);
      break;

  case "TeamsData":
      // Show Teams view
      oTeamsView.setVisible(true);
      break;

  case "DDDataDetails":
      // Show DD Data view
      oDDDataView.setVisible(true);
      break;

  case "StagesData":
      // Show Stages view
      oStagesView.setVisible(true);
      break;

  case "CommentsData":
      // Show Comments view
      oCommentsView.setVisible(true);
      break;

  case "TimeCaptureData":
      // Show Time Capture view
      oTimeCaptureView.setVisible(true);
      break;

  case "TeamsUsersData":
      // Show Teams Users view
      oTeamsUsersView.setVisible(true);
      break;

  case "ComponentStagesData":
      // Show Component Stages view
      oComponentStagesView.setVisible(true);
      break;

  case "TaskNotesData":
      // Show Task Notes view
      oTaskNotesView.setVisible(true);
      break;

  case "TimeLinesData":
      // Show Time Lines view
      oTimeLinesView.setVisible(true);
      break;

  case "PhasesData":
      // Show Phases view
      oPhasesView.setVisible(true);
      break;

  case "UsersRolesData":
      // Show Users Roles view
      oUsersRolesView.setVisible(true);
      break;

  case "IssueData":
      // Show Issue view
      oIssueView.setVisible(true);
      break;

  default:
      // Handle unknown key
      console.warn("Unknown selected key: " + selectedKey);
      break;
}

       
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
  