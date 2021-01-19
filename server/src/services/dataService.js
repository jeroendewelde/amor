/*
Import packages
*/
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/*
Import custom packages
*/
const { HTTPError, convertArrayToPagedObject } = require('../utils');

/*
File paths
*/
const filePathMessages = path.join(__dirname, '..', 'data', 'messages.json');
const filePathMatches = path.join(__dirname, '..', 'data', 'matches.json');
const filePathUsers = path.join(__dirname, '..', 'data', 'users.json');

/*
Write your methods from here
*/

//* Read users.json
const readDataFromUsersFile = () => {
  //flag is read only
  const data = fs.readFileSync(filePathUsers, {encoding: 'utf-8', flag: 'r'});
  const users = JSON.parse(data);

  return users;
}
//* Read messages.json
const readDataFromMessagesFile = () => {
  //flag is read only
  const data = fs.readFileSync(filePathMessages, {encoding: 'utf-8', flag: 'r'});
  const messages = JSON.parse(data);

  return messages;
}
//* Read matches.json
const readDataFromMatchesFile = () => {
  //flag is read only
  const data = fs.readFileSync(filePathMatches, {encoding: 'utf-8', flag: 'r'});
  const matches = JSON.parse(data);

  return matches;
}

//* Get all users
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();

    users.sort((a, b) => {
  
      return a.lastName.localeCompare(b.lastName);
    })

    //TODO paginering, sortering, filtering
    return users;
  } catch(error) {
    //! error teruggeven naar niveau hoger, 500 is interne server error
    throw new HTTPError('Can\'t get users!', 500);
  }
}

//* Get all messages
const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();

    //TODO paginering, sortering, filtering
    return messages;
  } catch(error) {
    throw new HTTPError('Can\'t get messages!', 500);
  }
}



//* Get all matches
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();

    return matches;
  } catch(error) {
    throw new HTTPError('Can\'t get matches!', 500);
  }
}

//* Get Received Messages From User by Id
const getReceivedMessagesFromUserById = (userId) => {
  let messages = readDataFromMessagesFile();
  
  try {
    const receivedMessages = messages.filter(m => m.receiverId === userId);
    if (!receivedMessages) {
      throw new HTTPError(`Can't find messages from user with UserId: ${userId}`, 404);
    }
    return receivedMessages;
  }
  catch (error) {
    throw error;
  }
}

//* Get Sent Messages From User by Id
const getSentMessagesFromUserById = (userId) => {
  let messages = readDataFromMessagesFile();
  
  try {
    const sentMessages = messages.filter(m => m.senderId === userId);
    if (!sentMessages) {
      throw new HTTPError(`Can't find messages from user with UserId: ${userId}`, 404);
    }
    return sentMessages;
  }
  catch (error) {
    throw error;
  }
}

//* Get Messages between User by Ids
const getMessagesBetweenUsers = (userId, friendId) => {
  let messages = readDataFromMessagesFile();
  
  try {
    messagesBetweenUsers = messages.filter(m => ((m.senderId === userId) && (m.receiverId === friendId)) || ((m.receiverId === userId) && (m.senderId === friendId)) );
    if (!messagesBetweenUsers) {
      throw new HTTPError(`Can't find messages from user with UserId: ${userId}`, 404);
    }
    return messagesBetweenUsers;
  }
  catch (error) {
    throw error;
  }
}

//* Create new Message for User 
// post object gaan we post.json file manipuleren
const createMessage = (message) => {
  try {
    const messages = readDataFromMessagesFile();
    // Array uitbreiden met het post object, via push
    // ID automatisch laten generen, datum van creatie ook door het systeem, niet door het formulier zelf
    // extra data bij dit object koppelen
    
    //create post
    // post spreaden, uuID gebruiken voor unique identifier
    const messagetoCreate = {
      ...message,
      id: uuidv4(),
      createdAt: Date.now()
    };
    console.log(messagetoCreate);
    //kan ook append, maar nu gaan we het wegscrhijven als string
    messages.push(messagetoCreate);
    //write message to messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));

    //Return the created message
    return messagetoCreate;
  } catch(error) {
    throw new HTTPError(`Can't create a new message !`, 501);
  }
}

  

//* Controller schrijven
// Callback van in "routes" implementeren, staat bij api/controllers


//TODO getUserById, ... 

// Export all the methods of the data service
// methodes beschikbaar stellen --> exporteren
module.exports = {
  getUsers, 
  getMessages,
  getMatches,
  getReceivedMessagesFromUserById,
  getSentMessagesFromUserById,
  getMessagesBetweenUsers,
  createMessage
};
