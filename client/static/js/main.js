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

      this.newMatchesList = null;
      this.respondedMatchesList = null;
      
      this.fetchUsers();

    },
    cacheElements() {
      this.$usersList = document.querySelector('.users__list');

      this.$inbox = document.querySelector('.inbox__list');
      this.$outbox = document.querySelector('.outbox__list');

      this.$inboxAmount = document.querySelector('.inbox__amount');
      this.$outboxAmount = document.querySelector('.outbox__amount');

      this.$conversation = document.querySelector('.conversations__list');

      this.$newMatches = document.querySelector('.matches--new__list');
      this.$respondedMatches = document.querySelector('.matches--responded__list');

      this.$friendImage = document.querySelector('.conversation__friendImage');

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

        const createdMessage = await this.tinderApi.addMessageBetweenUsers(this.currentUserId, this.currentFriendId, e.target['messenger__text'].value);
        this.fetchConversation();
        console.log(createdMessage);
      });

      // Listener zetten op list.
      this.$newMatches.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('submit');
        //console.log(e.target['userId'].value);
        //console.log(e.target['friendId'].value);
        console.log(e.target['rating'].value);

        const createdMatch = await this.tinderApi.addMatch(this.currentUserId, this.currentFriendId, e.target['rating'].value);
        this.fetchMatches();
        //const createdMessage = await this.tinderApi.addMessageBetweenUsers(this.currentUserId, this.currentFriendId, e.target['messenger__text'].value);
        //this.fetchConversation();
        //console.log(createdMessage);

      });
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
          <img src="${user.picture.thumbnail}" />
      <span>${user.firstName} ${user.lastName}</span>
      </a>
      </li>
      `).join('');
    },
    getUserInfoById(userId) {
      return this.users.find(u => u.id === userId);
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
      this.fetchMatches();
      
    },


    async fetchMessagesReceivedByUserId(onload = false) {
      this.receivedMessages = await this.tinderApi.getReceivedMessagesFromUser(this.currentUserId);
      
      /* console.log(this.receivedMessages); */
      this.generateUIForMessages('inbox', this.receivedMessages);
      this.$inboxAmount.innerHTML = this.receivedMessages.length;
      //console.log(onload);
      //console.log(this.receivedMessages[0].senderId);
      //console.log(onload);
      onload ? this.setActivefriend( this.receivedMessages[0].senderId, 'inbox') : ''; 
    },
    async fetchMessagesSentByUserId() {
      this.sentMessages = await this.tinderApi.getSentMessagesFromUser(this.currentUserId);
      //console.log(this.sentMessages);
      this.generateUIForMessages('outbox', this.sentMessages);
      this.$outboxAmount.innerHTML = this.sentMessages.length;
    },

    generateUIForMessages(destination, messages) {
      let tempStr = '';
      //console.log(destination, messages);
      
      tempStr =  messages.map(m => {
        //const user = this.getUserInfoById()
        const user = destination === 'inbox' ? this.getUserInfoById(m.senderId) : this.getUserInfoById(m.receiverId);
        return `
        <li class="${destination}__list__item" >
          <a href="#" data-id="${user.id}">
            <span>${user.firstName} ${user.lastName}</span>
            <span>${this.returnReadableDate(user.createdAt)}</span>
            <span>${m.message}</span>
          </a>
        </li>
        `}).join('');

      if(destination === 'inbox') {
        this.$inbox.innerHTML = tempStr;
      } else if (destination === 'outbox') {
        this.$outbox.innerHTML = tempStr;
      } 
    },
    setActivefriend(friendId, location) {
      this.currentFriendId = friendId;

      this.fetchConversation();


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

      this.$friendImage.innerHTML = `<img src="${this.users.find(u => u.id === this.currentFriendId).picture.thumbnail}"/>`;
    },

    async fetchConversation () {
      //op wachten want het is een promise
      this.conversation = await this.tinderApi.getConversationBetweenUsers(this.currentUserId, this.currentFriendId);
      //console.log(this.conversation);

      //const userId = this.users[0].id;
      this.generateUIForConversation();
      

      //this.setActivefriend(this.receivedMessages[O].senderId);
    },

    generateUIForConversation () {
      this.$conversation.innerHTML = this.conversation.map(message => `
      <li class="message--${message.senderId === this.currentUserId ? 'sent' : 'received'} conversation__list__item">
      <a href="#" data-id="${message.senderId}">
      <span class="message__user">${message.senderId}</span>
      <span>${message.message}</span>
      </a>
      </li>
      `).join('');
    },
    
    async fetchMatches() {
      //console.log('fetch messages, user:');
      //console.log(this.currentUserId);
      this.respondedMatchesList = await this.tinderApi.getMatchesForUser(this.currentUserId);
      console.log(this.respondedMatchesList.length);
      console.log(this.respondedMatchesList);


      console.log(`current user:${this.currentUserId}`);
      console.log(`Aantal matches beantwoord: ${this.respondedMatchesList.length}`);

      this.generateUIForRespondedMatches();
      this.generateUIForNewMatches();
      



      
      
    
    },
    generateUIForRespondedMatches() {
      //TODO check if !== currentuserId
      // TODO show options, enable, diable buttons to like/not like
      this.$respondedMatches.innerHTML = this.users.map(u => {
        const yourRating = this.respondedMatchesList.find(m => m.userId === this.currentUserId && m.friendId === u.id);
        const friendRating = this.respondedMatchesList.find(m => m.userId === u.id && m.friendId === this.currentUserId );
        //console.log(yourRating, friendRating);
        if(u.id !== this.currentUserId && (yourRating || friendRating)) { 
          return `
          <li>
            <img src="${u.picture.thumbnail}" />
            <span>${u.firstName}${u.lastName}</span>
            <span>AGE</span>
            <span>${u.gender === 'male' ? 'M' : 'F'}</span>
            <span>${u.location.city}</span>
            <span>${u.location.country}</span>
            <span>${friendRating ? friendRating.rating : 'GEEN'}</span>

            <span>CROSS | HEART | STAR</span>
            <span>YOUR ANSWER: ${yourRating ? yourRating.rating: 'GEEN'}</span>
          </li>`;
        }
      }).join('');
    },

    // voor onderste
    // loop trough users
    // find op matches


    generateUIForNewMatches() {
      const newMatches = [];

      this.users.map( u => {
        let isInList = this.respondedMatchesList.find(match => (match.userId === u.id) || (match.friendId === u.id) );
        //console.log(isInList);
        if(!isInList) {
          newMatches.push(u);
        }
      });

      console.log(`Aantal nieuwe matches: ${newMatches.length}`);
      
      this.$newMatches.innerHTML = newMatches.map(u => {
        //const answer = this.respondedMatchesList.find(m => m.userId === this.currentUserId);
        //const response = this.respondedMatchesList.find(m => m.friendId === this.currentUserId);
        //TODO form zetten hierrond?
        if(u.id !== this.currentUserId ) { 
          return `
          <li>
            <form method="post" action="">
              <img src="${u.picture.thumbnail}" />
              <label>${u.firstName}${u.lastName}</label>
              <span>AGE</span>
              <span>${u.gender === 'male' ? 'M' : 'F'}</span>
              <span>${u.location.city}</span>
              <span>${u.location.country}</span>
              <button>
              <input type="radio" name="rating" value="dislike">D</input>
              <input type="radio" name="rating" value="like">L</input>
              <input type="radio" name="rating" value="superlike">S</input></button>
            </form>
          </li>`;
        }
      }).join('');
    
    },
    returnReadableDate(timeCode) {
      const date = new Date(timeCode);
      //return `${date.getDate} ${dat.get} ${date.getHours()}:${date.getMinutes()}`;
      return `${date.toLocaleDateString()}`;
    },
    getAge(dob) {

      const now = new Date();
      const dobFull = new Date(dob);
    }

  }
  app.initialize();
})();