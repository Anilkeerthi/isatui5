sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";
 
    return Controller.extend("com.isat.isatui5.controller.Dashboard", {
        onInit: function () {
 
            // Set up view model
            var oViewModel = new JSONModel({
               
                ListOfInterfaces: [
                    { project: "Project A", interfaces: 10 },
                    { project: "Project B", interfaces: 15 },
                    { project: "Project C", interfaces: 8 },
                    { project: "Project D", interfaces: 12 },
                    { project: "Project E", interfaces: 20 },
                    { project: "Project F", interfaces: 25 },
                    { project: "Project G", interfaces: 30 },
                    { project: "Project H", interfaces: 18 }
                ],
                scenariosByPortfolios: [
                    { portfolio: "BTP", count: 34 },
                    { portfolio: "CX", count: 11 },
                    { portfolio: "Digital Core", count: 69 },
                    { portfolio: "HXM", count: 3 },
                    { portfolio: "Industries", count: 51 },
                    { portfolio: "Concur", count: 3 },
                    { portfolio: "SF", count: 8 }
                ],
                scenariosByInitiative: [
                    { initiative: "Rise with SAP", percentage: 21 },
                    { initiative: "Industry Cloud", percentage: 27.2 },
                    { initiative: "BTP", percentage: 7 },
                    { initiative: "Sustainability", percentage: 29.5 },
                    { initiative: "Others", percentage: 15.3 }
                ],
                portfolios: [
                    { key: "All", text: "All" },
                    { key: "BTP", text: "BTP" },
                    { key: "CX", text: "CX" },
                    { key: "DigitalCore", text: "Digital Core" },
                    { key: "HXM", text: "HXM" },
                    { key: "Industries", text: "Industries" },
                    { key: "Concur", text: "Concur" },
                    { key: "SF", text: "SF" }
                ],
                initiatives: [
                    { key: "All", text: "All" },
                    { key: "RiseWithSAP", text: "Rise with SAP" },
                    { key: "IndustryCloud", text: "Industry Cloud" },
                    { key: "BTP", text: "BTP" },
                    { key: "Sustainability", text: "Sustainability" },
                    { key: "Others", text: "Others" }
                ]
            });
            this.getView().setModel(oViewModel, "viewModel");
 
            // Set up calendar model
            var oCalendarModel = new JSONModel({
                startDate: new Date(2024, 8, 1), // September 1, 2024
                appointments: [
                    {
                        start: new Date(2024, 8, 2),
                        end: new Date(2024, 8, 2),
                        title: "Event 1",
                        type: "Type01"
                    }
                    // Add more appointments as needed
                ]
            });
            this.getView().setModel(oCalendarModel, "calendar");
        },
 
        onAfterRendering: function() {
            this._setChartProperties();
        },
 
        _setChartProperties: function() {
            var chartProperties = {
                plotArea: {
                    dataLabel: {
                        visible: true,
                        showTotal: false
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: false
                }
            };
 
            this.getView().byId("idScenariosReleaseChart").setVizProperties(chartProperties);
            this.getView().byId("idScenariosPortfoliosChart").setVizProperties(chartProperties);
           
            var donutChartProperties = {
                plotArea: {
                    dataLabel: {
                        visible: true,
                        showTotal: false
                    },
                    drawingEffect: "glossy"
                },
                legend: {
                    visible: true,
                    position: "bottom"
                },
                title: {
                    visible: false
                }
            };
            this.getView().byId("idScenariosInitiativeChart").setVizProperties(donutChartProperties);
        },
        onClick:function(){
            var Route = this.getOwnerComponent().getRouter();
            Route.navTo("RouteHomeScreen")
        },

        onAdminButtonPress:function(){
			var routee = this.getOwnerComponent().getRouter();
			routee.navTo("RouteAdminScreen")
		},
       
       
       
 
           
       
 
       
 
    });
});