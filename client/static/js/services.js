const TINDER_BASE_PATH = 'http://localhost:8080/api';

function TinderApi () {
  this.getUsers = async () => {    
    try {
      //Fetch opdracht en instrusties om json terug te sturen
      //geeft promise terug, dus AWAIT
      const response = await fetch(`${TINDER_BASE_PATH}/users`);

      //geeft response terug dus omzetten naar json
      const data = await response.json();
      /* console.log(data); */
      return data;
    } catch(error) {
      //notification teruggeven aan de eindgebruiker
      console.log('An error occured!', error);
    }
  };

  this.getReceivedMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=received`);

      let data = await response.json();
      //console.log(data);
      return data;
    } catch(error) {
    
      console.log('An error occured!', error);
    }
  };

  this.getSentMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=sent`);

      let data = await response.json();
      //console.log(data);
      return data;
    } catch(error) {
    
      console.log('An error occured!', error);
    }
  };

  this.getConversationBetweenUsers = async (userId, friendId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=conversation&friendId=${friendId}`);

      let data = await response.json();
      //console.log(data);
      return data;
    } catch(error) {
    
      console.log('An error occured!', error);
    }
  };

  this.addMessageBetweenUsers = async (userId, friendId, message) => {
    try {

      const messageToCreate = {
        'senderId' : userId,
        'receiverId' : friendId,
        'message' : message
      }
      console.log(messageToCreate);
      
      const response = await fetch(`${TINDER_BASE_PATH}/messages`, {
        method: 'POST',
        mode: 'cors',
        headers : {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(messageToCreate),
      });

      let data = await response.json();
      console.log(data);
      return data;
    } catch(error) {
    
      console.log('An error occured!', error);
    }

  };

  this.getMatchesForUser = async (userId) => {
  };

  this.addMatch = async (userId, friendId, rating) => {
  };
}