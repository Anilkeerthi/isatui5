sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/m/MessageToast",
		"sap/m/Dialog",
		"sap/m/List",
		"sap/m/StandardListItem",

],
	function (Controller, JSONModel, fioriLibrary, MessageToast,Dialog,List,StandardListItem) {
		"use strict";

		return Controller.extend("com.isat.isatui5.controller.HomeScreen", {
			onInit: function () {


				var oModel = new sap.ui.model.json.JSONModel({
					actionButtonsInfo: {
						midColumn: {
							fullScreen: true,       // This controls the visibility of the full screen button
							exitFullScreen: false,  // This controls the visibility of the exit full screen button
							closeColumn: true       // This controls the visibility of the close column button
						}
					}
				});
			
				// Set the model to the view
				this.getView().setModel(oModel);

				this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");

				var oModell = this.getOwnerComponent().getModel("comboJsonModel");
				this.getView().setModel(oModell, "comboJsonModel")
			

				var Model = this.getOwnerComponent().getModel("dataJsonModel");
				this.getView().setModel(Model, "jsonModel")
				console.log(Model)

				var OModel = this.getOwnerComponent().getModel("CustomerData");
				this.getView().getModel(OModel) 
				console.log(OModel)
			},


			backToDashBoard: function () {
				var route = this.getOwnerComponent().getRouter();
				route.navTo("RouteDashboard")
			},

			onAddButtonPress: function () {

				if (!this.ChangeDialog) {
					this.ChangeDialog = this.loadFragment({
						name: "com.isat.isatui5.view.Add" // Update the path to your fragment
					});
				}


				this.ChangeDialog.then(function (Dialog) {
					this.Dialog = Dialog;

					this.Dialog.open();
				}.bind(this));
			},

			onListItemPress: function (oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("jsonModel");

				var oFlexibleColumnLayout = this.getView().byId("flexibleColumnLayout");
				oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

				// Navigate to mid column to show ObjectPageLayout
				// this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

				// // Bind the selected item to the ObjectPageLayout in mid column
				// ;
				// var oMidColumnPage = this.byId("flexibleColumnLayout");
				// oMidColumnPage.bindElement({
				// 	path: oCtx.getPath(),
				// 	model: "jsonModel"
				// });
			},

			ItemPress: function (oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("jsonModel");

				var oFlexibleColumnLayout = this.getView().byId("flexibleColumnLayout");
				oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.ThreeColumnsMidExpanded);

				// Navigate to mid column to show ObjectPageLayout
				// this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

				// // Bind the selected item to the ObjectPageLayout in mid column
				// ;
				// var oMidColumnPage = this.byId("flexibleColumnLayout");
				// oMidColumnPage.bindElement({
				// 	path: oCtx.getPath(),
				// 	model: "jsonModel"
				// });
			},



			handleFullScreen: function () {
				this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.MidColumnFullScreen);
			},
			
			handleExitFullScreen: function () {
				this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
			},
			
			handleClose: function () {
				this.oFlexibleColumnLayout.setLayout(fioriLibrary.LayoutType.OneColumn);
			},

		
			
			onClickOnDisplay: function (oEvent) {
				// Get the selected row's data
				var oSelectedItem = oEvent.getSource().getParent();
				var oContext = oSelectedItem.getBindingContext("jsonModel");
				var oData = oContext.getObject();
				
				// Store the context path to update the original model later
				this._originalContextPath = oContext.getPath();
			
				// Add a new property 'editable' to control the edit mode
				oData.editable = false;
				oData.buttonText = "Edit"; // Button starts as 'Edit'
			
				// Create a new JSON model to bind the dialog content
				var oDialogModel = new sap.ui.model.json.JSONModel();
				oDialogModel.setData(oData);
				
				// Bind the dialog with the selected row data
				this.getView().setModel(oDialogModel, "dialogModel");
				
				// Open the dialog
				this.byId("detailsDialog").open();
			},
			
			onToggleEdit: function () {
				// Get the dialog model
				var oDialogModel = this.getView().getModel("dialogModel");
				var oData = oDialogModel.getData();
			
				// Toggle the 'editable' property and button text
				if (oData.editable) {
					// Currently in edit mode, save changes
					oData.editable = false;
					oData.buttonText = "Edit";
			
					// Save the changes to the backend and update the original model
					this._saveChanges(oData);
				} else {
					// Enable edit mode
					oData.editable = true;
					oData.buttonText = "Save";
				}
			
				// Update the model
				oDialogModel.setData(oData);
			},
			
			_saveChanges: function (oData) {
				// Get the original model
				var oJsonModel = this.getView().getModel("jsonModel");
			
				// Update the original model's data using the stored context path
				oJsonModel.setProperty(this._originalContextPath, oData);
			
				// You can implement backend save logic here if necessary
				// Example: Sending the updated data to the backend
				console.log("Saving changes:", oData);
			
				// Close the dialog after saving
				this.onCloseDialog();
			},
			
			onCloseDialog: function () {
				// Close the dialog
				this.byId("detailsDialog").close();
			}
			

		});

	});