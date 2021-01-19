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
  const data = fs.readFileSync(filePathUsers, {encoding: 'utf-8', flag: 'r'});
  const users = JSON.parse(data);

  return users;
}
//* Read messages.json
const readDataFromMessagesFile = () => {
  const data = fs.readFileSync(filePathMessages, {encoding: 'utf-8', flag: 'r'});
  const messages = JSON.parse(data);

  return messages;
}
//* Read matches.json
const readDataFromMatchesFile = () => {
  const data = fs.readFileSync(filePathMatches, {encoding: 'utf-8', flag: 'r'});
  const matches = JSON.parse(data);

  return matches;
}

//* Get all users
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();

    //TODO check sorting
    users.sort((a, b) => {
      return a.lastName.localeCompare(b.lastName);
    })
    return users;
  } catch(error) {
    throw new HTTPError(`Can't get all users!`, 500);
  }
}

//* Get User by Id
const getUserById = (userId) => {
  try {
    const users = readDataFromUsersFile();
    const selectedUser = users.find(u => u.id === userId);

    //TODO sort
    if (!selectedUser) {
      throw new HTTPError(`Can't find user with userId:${userId}!`, 404);
    }
    return selectedUser;
  }
  catch (error) {
    throw error;
  }
}

//* Create new Message between users
const createUser = (user) => {
  try {
    const users = readDataFromUsersFile();    
    const userToCreate = {
      ...user,
      id: uuidv4(),
      createdAt: Date.now()
    };
  
    users.push(userToCreate);
    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    return userToCreate;
  } catch(error) {
    throw new HTTPError(`Can't create a user for:${user.username}!`, 501);
  }
}

//* Get all messages
const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();

    //TODO sort by date
    return messages;
  } catch(error) {
    throw new HTTPError(`Can't get all users!`, 500);
  }
}

//* Get Messages by Id
const getMessageById = (messageId) => {
  try {
    const messages = readDataFromMessagesFile();
    const selectedMessage = messages.find(m => m.id === messageId);

    //TODO sort
    if (!selectedMessage) {
      throw new HTTPError(`Can't find message with id:${messageId}!`, 404);
    }
    return selectedMessage;
  }
  catch (error) {
    throw error;
  }
}

//* Get Received Messages From User by Id
const getReceivedMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    const receivedMessages = messages.filter(m => m.receiverId === userId);

    //TODO sort
    if (!receivedMessages) {
      throw new HTTPError(`Can't find received messages for user with userId:${userId}!`, 404);
    }
    return receivedMessages;
  }
  catch (error) {
    throw error;
  }
}

//* Get Sent Messages From User by Id
const getSentMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    const sentMessages = messages.filter(m => m.senderId === userId);

    //TODO sort
    if (!sentMessages) {
      throw new HTTPError(`Can't find sent messages for user with userId:${userId}!`, 404);
    }
    return sentMessages;
  }
  catch (error) {
    throw error;
  }
}

//* Get Messages between User by Ids
const getMessagesBetweenUsers = (userId, friendId) => {
  try {
    const messages = readDataFromMessagesFile();
    const messagesBetweenUsers = messages.filter(m => ((m.senderId === userId) && (m.receiverId === friendId)) || ((m.receiverId === userId) && (m.senderId === friendId)) );

    if (!messagesBetweenUsers) {
      throw new HTTPError(`Can't find messages between users with ids:${userId} and ${friendId}!`, 404);
    }
    return messagesBetweenUsers;
  }
  catch (error) {
    throw error;
  }
}

//* Create new Message between users
const createMessage = (message) => {
  try {
    const messages = readDataFromMessagesFile();    
    const messagetoCreate = {
      ...message,
      id: uuidv4(),
      createdAt: Date.now()
    };
  
    messages.push(messagetoCreate);
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    return messagetoCreate;
  } catch(error) {
    throw new HTTPError(`Can't send a new message from user with id:${message.senderId} to user with id:${message.receiverId}!`, 501);
  }
}

//* Get all matches
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();

    //TODO sort
    return matches;
  } catch(error) {
    throw new HTTPError(`Can't get all matches!`, 500);
  }
}

//* Get Match between users by Ids
const getMatchByIds = (senderId, receiverId) => {
  try {
    const matches = readDataFromMatchesFile();
    const match = matches.find(m => m.userId === senderId && m.friendId === receiverId);

    //TODO sort
    if (!match) {
      throw new HTTPError(`Can't find match from user with userId:${senderId} to user with userId:${receiverId}!`, 404);
    }
    return match;
  }
  catch (error) {
    throw error;
  }
}

//* Get all matches including user with userId
const getMatchesFromUserById = (userId) => {
  try {
    const matches = readDataFromMatchesFile();
    const matchesFromUser = matches.filter(m => m.userId === userId || m.friendId === userId );

    //TODO sort
    if (!matchesFromUser) {
      throw new HTTPError(`Can't find matches with userId:${userId}!`, 404);
    }
    return matchesFromUser;
  }
  catch (error) {
    throw error;
  }
}

//* Create new match from 1 user to another
const createMatch = (match) => {
  try {
    const matches = readDataFromMatchesFile();    
    const matchtoCreate = {
      ...match,
      id: uuidv4(),
      createdAt: Date.now()
    };
  
    matches.push(matchtoCreate);
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    return matchtoCreate;
  } catch(error) {
    throw new HTTPError(`Can't create a match from user with id:${match.senderId} to user with id:${match.receiverId}!`, 501);
  }
}

//* Export methods
module.exports = {
  getUsers,
  getUserById,
  createUser,
  /* updateUser,
  deleteUser, */
  getMessages,
  getMessageById,
  getReceivedMessagesFromUserById,
  getSentMessagesFromUserById,
  getMessagesBetweenUsers,
  createMessage,
  /* updateMessage,
  deleteMessage, */
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  createMatch,
  /* updateMatch,
  deleteMatch */
};
