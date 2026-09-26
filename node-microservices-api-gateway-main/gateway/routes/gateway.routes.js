const express = require('express');
const router = express.Router();
const controller = require('../controllers/gateway.controller');

router.post("/add_service", controller.addService);

router.get("/services", controller.getServices);

router.get("/metrics", controller.getMetrics);

router.get("/metrics/service/:serviceName/instances", controller.getServiceInstancesMetrics);

router.get("/metrics/recent-req-data" , controller.getRecentRequestsData);

router.get("/metrics/live" , controller.getLiveMetrics);

router.delete('/remove_service', controller.removeService);


router.use(controller.handleProxyRequest);

module.exports = router;