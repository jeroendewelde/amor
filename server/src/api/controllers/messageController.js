/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all messages
*/
const getMessages = (req, res, next) => {
  try {
    const messages = dataService.getMessages();

    res.status(200).json(messages)
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific message
*/
const getMessageById = (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = dataService.getMessageById(messageId);

    res.status(200).json(message)
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get messages from a specific user
*/
const getMessagesFromUserById = (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, friendId } = req.query;
    let messages = '';

    if(type === 'received') {
      messages = dataService.getReceivedMessagesFromUserById(userId);
    } else if(type === 'sent') {
      messages = dataService.getSentMessagesFromUserById(userId);
    } else if(type === 'conversation') {
      messages = dataService.getMessagesBetweenUsers(userId, friendId);
    }
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new message
*/
const createMessage = (req, res, next) => {
  try {
    const message = req.body;
    const createdMessage = dataService.createMessage(message);

    res.status(201).json(createdMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific message
*/
const updateMessage = (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = req.body;
    const updatedMessage = dataService.updateMessage(messageId, message);

    res.status(200).json(updatedMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific message
*/
const deleteMessage = (req, res, next) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = dataService.deleteMessage(messageId);

    res.status(200).json(deletedMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMessage,
  deleteMessage,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  updateMessage,
};
