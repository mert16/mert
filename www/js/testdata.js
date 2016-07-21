// MERT App based on IONIC Framework

/*
testdata.js
(c) Philip Pang, July 2016

Contains initial data that simulates what is queried
from a remote database.

This file is not needed once the App is working.
*/

gv_Bookings = [
  {
    id: "0",
    res: "1",
    user: "Philip",
    begDate: getNextDate(today, 0),
    begTime: "0100",
    endDate: getNextDate(today, 0),
    endTime: "0200"
  },
  {
    id: "1",
    res: "1",
    user: "Philip",
    begDate: getNextDate(today, 0),
    begTime: "1000",
    endDate: getNextDate(today, 0),
    endTime: "1130"
  },
  {
    id: "2",
    res: "2",
    user: "David",
    begDate: getNextDate(today, 1),
    begTime: "1500",
    endDate: getNextDate(today, 2),
    endTime: "1000"
  },
  {
    id: "3",
    res: "3",
    user: "Benny",
    begDate: getNextDate(today, 2),
    begTime: "1100",
    endDate: getNextDate(today, 2),
    endTime: "1500"
  },
  {
    id: "4",
    res: "4",
    user: "Francis",
    begDate: getNextDate(today, 3),
    begTime: "0900",
    endDate: getNextDate(today, 3),
    endTime: "1600"
  },
  {
    id: "5",
    res: "5",
    user: "Ratheesh",
    begDate: getNextDate(today, 4),
    begTime: "0830",
    endDate: getNextDate(today, 4),
    endTime: "1200"
  }
];

var gv_Resources = [
  { id: 1, name: "Projector", owner: "R&D West", image: "" },
  { id: 2, name: "Oscilloscope", owner: "R&D East", image: "" },
  { id: 3, name: "3D Printer", owner: "Operations", image: "" },
  { id: 4, name: "Smart Board", owner: "Marketing", image: "" },
  { id: 5, name: "Frequency Generator 1", owner: "Test Lab", image: "" },
  { id: 6, name: "Frequency Generator 2", owner: "Test Lab", image: "" },
  { id: 7, name: "Laser Ruler", owner: "Test Lab", image: "" },
  { id: 8, name: "Tablet PC 1", owner: "Test Lab", image: "" },
  { id: 9, name: "Tablet PC 2", owner: "Test Lab", image: "" },
  { id: 10, name: "Linux Server", owner: "Test Lab", image: "" },
  { id: 11, name: "Video Camera", owner: "Marketing", image: "" },
  { id: 12, name: "Android Tablet", owner: "Marketing", image: "" },
  { id: 13, name: "Apple iPad Mini", owner: "Marketing", image: "" },
  { id: 14, name: "LAN Analyser", owner: "Test Lab", image: "" }
];

//alert ("testdata.js loaded");
