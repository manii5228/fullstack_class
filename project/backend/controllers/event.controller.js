const { v4: uuid } = require("uuid");
const eventModel = require("../models/event.model");
const eventService = require("../services/event.service");

exports.createEvent = async (req,res)=>{

  const event = {

    event_id: uuid(),
    event_type: req.body.event_type,
    user_id: req.user.id,
    task_id: req.body.task_id

  };

  await eventModel.createEvent(event);

  await eventService.broadcastEvent(event);

  res.json({message:"event stored"});

};

exports.getEvents = async (req,res)=>{

  const events =
  await eventModel.getEvents();

  res.json(events);

};