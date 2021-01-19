(() => {
  const app = {
    initialize() {
      this.cacheElements();
      this.registerListeners();
      //geimporteerd van js/services
      this.tinderApi = new TinderApi();

      // okaal bijhouden op dit niveau
      this.users = null;

      //actieve user
      this.currentUserId = null;
      this.receivedMessages = null;
      this.sendMessages = null;

      this.currentFriendId = null;
      this.conversation = null;

      
      this.fetchUsers();

    },
    cacheElements() {
      this.$usersList = document.querySelector('.users__list');

      this.$inbox = document.querySelector('.inbox__list');
      this.$outbox = document.querySelector('.outbox__list');

      this.$conversation = document.querySelector('.conversations__list');

      this.$form = document.querySelector('#messenger');
    },

    registerListeners() {
      this.$usersList.addEventListener('click' , e => {
        const userId = e.target.dataset.id || e.target.parentNode.dataset.id;
        //console.log('click', userId);
        this.setActiveUser(userId);

        this.fetchMessagesReceivedByUserId(true);
        this.fetchMessagesSentByUserId();
      });
      this.$inbox.addEventListener('click' , e => {
        const userId = e.target.dataset.id || e.target.parentNode.dataset.id;
        //console.log('click', userId);
        this.setActivefriend(userId, 'inbox');
        this.fetchConversation();
        //console.log(this.currentFriendId);
      });
      this.$outbox.addEventListener('click' , e => {
        const userId = e.target.dataset.id || e.target.parentNode.dataset.id;
        //console.log('click', userId);
        this.setActivefriend(userId, 'outbox');
        this.fetchConversation();
        //console.log(this.currentFriendId);
      });

      // als je een await zet voor tinder, dan moet uw e => { async worden
      this.$form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('submit');

/*         const messageToCreate = {
          'senderId' : this.currentUserId,
          'receiverId' : this.currentFriendId,
          'message' : e.target['messenger__text']
        } */

        const createdMessage = await this.tinderApi.addMessageBetweenUsers(this.currentUserId, this.currentFriendId, e.target['messenger__text'].value);
        this.fetchConversation();
        console.log(createdMessage);
      })
    },

    async fetchUsers () {
      //op wachten want het is een promise
      this.users = await this.tinderApi.getUsers();

      const userId = this.users[0].id;
      this.generateUIForUsers();
      this.setActiveUser(userId);
      
      this.fetchMessagesReceivedByUserId(true);
      this.fetchMessagesSentByUserId();
      //this.setActivefriend(this.receivedMessages[O].senderId);
    },

    generateUIForUsers () {
      this.$usersList.innerHTML = this.users.map(user => `
      <li class="users__list__item">
      <a href="#" data-id="${user.id}">
      <span>${user.firstName} ${user.lastName}</span>
      </a>
      </li>
      `).join('');
    },
    
    setActiveUser(userId) {
      //TODO hier een queryeselector opvragen en de lengte van de users in getalletje steken,...
      this.currentUserId = userId;
      const $selectedUser =  this.$usersList.querySelector(`.users__list__item.selected`);
      /* console.log($selectedUser); */
      if ($selectedUser !== null) {
        $selectedUser.classList.remove('selected');
      }

      this.$usersList.querySelector(`.users__list__item > a[data-id="${userId}"]`).parentNode.classList.add('selected');
    },


    async fetchMessagesReceivedByUserId(onload = false) {
      this.receivedMessages = await this.tinderApi.getReceivedMessagesFromUser(this.currentUserId);
      
      /* console.log(this.receivedMessages); */
      this.generateUIForMessages('inbox', this.receivedMessages);
      //console.log(onload);
      //console.log(this.receivedMessages[0].senderId);
      console.log(onload);
      onload ? this.setActivefriend( this.receivedMessages[0].senderId, 'inbox') : ''; 
    },
    async fetchMessagesSentByUserId() {
      this.sentMessages = await this.tinderApi.getSentMessagesFromUser(this.currentUserId);
      //console.log(this.sentMessages);
      this.generateUIForMessages('outbox', this.sentMessages);
    },

    generateUIForMessages(destination, messages) {
      let tempStr = '';
      //console.log(destination, messages);
      
      tempStr =  messages.map(m => `
      <li class="${destination}__list__item" >
        <a href="#" data-id="${destination === 'inbox' ? m.senderId : m.receiverId}">
        
          <span>${destination === 'inbox' ? this.users.find(u => u.id === m.senderId).firstName : this.users.find(u => u.id === m.receiverId).firstName}</span>
          <span>${destination === 'inbox' ? m.senderId : m.receiverId}</span>

        </a>
      </li>
      `).join('');

      if(destination === 'inbox') {
        this.$inbox.innerHTML = tempStr;
      } else if (destination === 'outbox') {
        this.$outbox.innerHTML = tempStr;
      } 
    },
    setActivefriend(friendId, location) {
      this.currentFriendId = friendId;
      $selectFriendInbox = null;
      $selectFriendOutbox = null;

      $selectFriendInbox = this.$inbox.querySelector(`.inbox__list__item.selected`);
      $selectFriendOutbox = this.$outbox.querySelector(`.outbox__list__item.selected`);

      if ($selectFriendInbox !== null) {
        $selectFriendInbox.classList.remove('selected');
      } else if($selectFriendOutbox !== null) {
        $selectFriendOutbox.classList.remove('selected');
      }

      location === 'inbox' ? this.$inbox.querySelector(`.${location}__list__item > a[data-id="${friendId}"]`).parentNode.classList.add('selected') : this.$outbox.querySelector(`.${location}__list__item > a[data-id="${friendId}"]`).parentNode.classList.add('selected');
    },

    async fetchConversation () {
      //op wachten want het is een promise
      this.conversation = await this.tinderApi.getConversationBetweenUsers(this.currentUserId, this.currentFriendId);
      console.log(this.conversation);

      //const userId = this.users[0].id;
      this.generateUIForConversation();
      

      //this.setActivefriend(this.receivedMessages[O].senderId);
    },

    generateUIForConversation () {
      this.$conversation.innerHTML = this.conversation.map(message => `
      <li class="conversation__list__item">
      <a href="#" data-id="${message.senderId}">
      <span class="message__user">${message.senderId}</span>
      <span>${message.message}</span>
      </a>
      </li>
      `).join('');
    },






  }
  app.initialize();
})();