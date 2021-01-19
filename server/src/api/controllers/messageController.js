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
    const messages = dataService.getMessages();
    res.status(200).json(messages)
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
    console.log(type);
    console.log(friendId);
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
    // Get body (message) from request
    const message = req.body;

    
    

    const createdMessage = dataService.createMessage(message);

    //Send response to user
    // 201 is something is made/created
    // return post with id and createdAt
    res.status(201).json(createdMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific message
*/
const updateMessage = (req, res, next) => {
  handleHTTPError(new HTTPError('The action method is not yet implemented!', 501), next);
};

/*
Delete a specific message
*/
const deleteMessage = (req, res, next) => {
  handleHTTPError(new HTTPError('The action method is not yet implemented!', 501), next);
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
