const mongoose = require('mongoose');

const dashboardSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:  { type: String, required: true },
    labels: { type: Array, required: true },
    datasets: { type: Array, required: true }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);