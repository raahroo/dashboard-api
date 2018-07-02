const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Dashboard = require("../models/dashboard");

router.get("/", (req, res, next) => {
    Dashboard.find()
    .select("name labels _id datasets")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        dashboards: docs.map(doc => {
          return {
            name: doc.name,
            labels: doc.labels,
            datasets: doc.datasets,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/dashboards/" + doc._id
            }
          };
        })
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", (req, res, next) => {
  const dashboard = new Dashboard({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    labels: req.body.labels,
    datasets: req.body.datasets 
  });
  dashboard
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created dashboard successfully",
        createdDashboard: {
            name: result.name,
            labels: result.labels,
            datasets: result.datasets,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/dashboards/" + result._id
            }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:dashboardId", (req, res, next) => {
  const id = req.params.dashboardId;
  Dashboard.findById(id)
    .select('name labels _id datasets')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            dashboard: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/dashboards'
            }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:dashboardId", (req, res, next) => {
  const id = req.params.dashboardId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Dashboard.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Dashboard updated',
          request: {
              type: 'GET',
              url: 'http://localhost:3000/dashboards/' + id
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:dashboardId", (req, res, next) => {
  const id = req.params.dashboardId;
  Dashboard.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Dashboard deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:3000/dashboards',
              body: { name: 'String', labels: 'Array', datasets:'Array' }
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;