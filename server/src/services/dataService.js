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

    if (!selectedUser) {
      throw new HTTPError(`Can't find user with userId:${userId}!`, 404);
    }
    return selectedUser;
  }
  catch (error) {
    throw error;
  }
}

//* Create new Message User
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

//* Update User
const updateUser = (userId, user) => {
  try {
    const users = readDataFromUsersFile();    
    const userToUpdate = {
      ...user,
    };
    userToUpdate.modifiedAt = Date.now();

    const findIndex = users.findIndex(u => u.id === userId);
    if( findIndex === -1) {
      throw new HTTPError(`Can't update the user with userId:${userId}!`, 404);
    }

    users[findIndex] = {
      ...users[findIndex],
      ...userToUpdate
    };

    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    return userToUpdate;
  } catch(error) {
    throw error;
  }
};

//* Delete User
const deleteUser = (userId) => {
  try {
    const users = readDataFromUsersFile();    
    const findIndex = users.findIndex(u => u.id === userId);

    if( findIndex === -1) {
      throw new HTTPError(`Can't find the user with userId:${userId}!`, 404);
    }

    users.splice(findIndex, 1);
    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    return {
      'message': `User with UserId:${userId} is succesfully removed!`
    }
  } catch(error) {
    throw error;
  }
};

//* Get all messages
const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();

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

    if (!receivedMessages) {
      throw new HTTPError(`Can't find received messages for user with userId:${userId}!`, 404);
    }

    receivedMessages.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      } if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    });
    
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

    if (!sentMessages) {
      throw new HTTPError(`Can't find sent messages for user with userId:${userId}!`, 404);
    }

    sentMessages.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      } if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    });
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

//* Update Message
const updateMessage = (messageId, message) => {
  try {
    const messages = readDataFromMessagesFile();
    const messageToUpdate = {
      ...message,
    };
    messageToUpdate.modifiedAt = Date.now();

    const findIndex = messages.findIndex(m => m.id === messageId);
    if( findIndex === -1) {
      throw new HTTPError(`Can't update the message with messageId:${messageId}!`, 404);
    }

    messages[findIndex] = {
      ...messages[findIndex],
      ...messageToUpdate
    };

    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    return messageToUpdate;
  } catch(error) {
    throw error;
  }
};

//* Delete Message
const deleteMessage = (messageId) => {
  try {
    const messages = readDataFromMessagesFile();    
    const findIndex = messages.findIndex(m => m.id === messageId);

    if( findIndex === -1) {
      throw new HTTPError(`Can't find the message with messageId:${messageId}!`, 404);
    }

    messages.splice(findIndex, 1);
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    return {
      'message': `Message with messageId:${userId} is succesfully removed!`
    }
  } catch(error) {
    throw error;
  }
};


//* Get all matches
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();

    return matches;
  } catch(error) {
    throw new HTTPError(`Can't get all matches!`, 500);
  }
}

//* Get Match between users by Ids
const getMatchByIds = (senderId, receiverId) => {
  try {
    const matches = readDataFromMatchesFile();
    const match = matches.find(m => (m.userId === senderId) && (m.friendId === receiverId));

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
    //const matchesFromUser = matches.filter(m => (m.userId === userId) || (m.friendId === userId) );
    const matchesFromUser = matches.filter(m => (m.userId === userId) || (m.friendId === userId) );
    
    if (!matchesFromUser) {
      throw new HTTPError(`Can't find matches with userId:${userId}!`, 404);  
    }

    matchesFromUser.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      } if (a.createdAt < b.createdAt) {
        return 1;
      }
      return 0;
    });
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
      createdAt: Date.now()
    };
  
    matches.push(matchtoCreate);
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    return matchtoCreate;
  } catch(error) {
    throw new HTTPError(`Can't create a match from user with id:${match.senderId} to user with id:${match.receiverId}!`, 501);
  }
}

//* Update Match
const updateMatch = (sederId, receiverId, match) => {
  try {
    const matches = readDataFromMatchesFile();
    const matchToUpdate = {
      ...match,
    };
    messageToUpdate.modifiedAt = Date.now();

    const findIndex = matches.findIndex(m => (m.userId === senderId) && (m.friendId === receiverId));
    if( findIndex === -1) {
      throw new HTTPError(`Can't update the match form user with userId:${senderId} to user with userId:${receiverId}!`, 404);
    }

    matches[findIndex] = {
      ...matches[findIndex],
      ...matchToUpdate
    };

    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    return matchToUpdate;
  } catch(error) {
    throw error;
  }
};

//* Delete Match
const deleteMatch = (senderId, receiverId) => {
  try {
    const matches = readDataFromMatchesFile();    
    const findIndex = matches.findIndex(m => (m.userId === senderId) && (m.friendId === receiverId));

    if( findIndex === -1) {
      throw new HTTPError(`Can't find the match from user with userId:${senderId} to user with user with userId:${receiverId}!`, 404);
    }

    matches.splice(findIndex, 1);
    fs.writeFileSync(filePathMessages, JSON.stringify(matches, null, 2));
    return {
      'message': `Match with userId:${userId} and friendId:${friendId} is succesfully removed!`
    }
  } catch(error) {
    throw error;
  }
};


//* Export methods
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMessages,
  getMessageById,
  getReceivedMessagesFromUserById,
  getSentMessagesFromUserById,
  getMessagesBetweenUsers,
  createMessage,
  updateMessage,
  deleteMessage,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  createMatch,
  updateMatch,
  deleteMatch
};
