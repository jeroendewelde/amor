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

      this.$inboxCount = document.querySelector('.inbox__count');
      this.$outboxCount = document.querySelector('.outbox__count');

      this.$friendImage = document.querySelector('.conversation__friendImage');
      this.$friendName = document.querySelector('.conversation__friendName');
      this.$conversation = document.querySelector('.conversation__messageArea');

      this.$newMatches = document.querySelector('.matches--new__list');
      this.$respondedMatches = document.querySelector('.matches--responded__list');

      

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
        e.target['messenger__text'].value = '';
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
        this.fetchConversation();
        //console.log(createdMessage);

      });

      //Listener op Unanswered Matches
      this.$newMatches.addEventListener('click', async e => {
        const friendId = e.target.dataset.friendid || e.target.parentNode.dataset.friendid || e.target.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid || e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.friendid;
        const rating = e.target.dataset.rating || e.target.parentNode.dataset.rating || e.target.parentNode.parentNode.dataset.rating;
        
        console.log(friendId, rating);
        
        const createdMatch = (friendId && rating) ? await this.tinderApi.addMatch(this.currentUserId, friendId, rating ) : '';
        this.fetchMatches();
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
        <a href="#" data-id=${user.id}>
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
      const $selectedUser =  this.$usersList.querySelector(`.users__list__item a.selected`);
      /* console.log($selectedUser); */
      if ($selectedUser !== null) {
        $selectedUser.classList.remove('selected');
      }

      this.$usersList.querySelector(`.users__list__item > a[data-id="${userId}"]`).classList.add('selected');
      this.fetchMatches();
      
    },


    async fetchMessagesReceivedByUserId(onload = false) {
      this.receivedMessages = await this.tinderApi.getReceivedMessagesFromUser(this.currentUserId);
      
      /* console.log(this.receivedMessages); */
      this.generateUIForMessages('inbox', this.receivedMessages);
      this.$inboxCount.innerHTML = this.receivedMessages.length;
      //console.log(onload);
      //console.log(this.receivedMessages[0].senderId);
      //console.log(onload);
      onload ? this.setActivefriend( this.receivedMessages[0].senderId, 'inbox') : ''; 
    },
    async fetchMessagesSentByUserId() {
      this.sentMessages = await this.tinderApi.getSentMessagesFromUser(this.currentUserId);
      //console.log(this.sentMessages);
      this.generateUIForMessages('outbox', this.sentMessages);
      this.$outboxCount.innerHTML = this.sentMessages.length;
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
            <span class="list__item__sender">${user.firstName} ${user.lastName}</span>
            <span class="list__item__time">${this.returnReadableDate(user.createdAt)}</span>
            <span class="list__item__message">${m.message}</span>
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

      const currentFriend = this.users.find(u => u.id === this.currentFriendId);
      this.$friendImage.innerHTML = `<img src="${currentFriend.picture.thumbnail}"/>`;
      this.$friendName.innerHTML = `${currentFriend.firstName} ${currentFriend.lastName}`;
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
      <li class="message--${message.senderId === this.currentUserId ? 'sent' : 'received'} conversation__message">
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
        let yourRating = this.respondedMatchesList.find(m => m.userId === this.currentUserId && m.friendId === u.id);
        yourRating = yourRating ? yourRating.rating : null;
        let friendRating = this.respondedMatchesList.find(m => m.userId === u.id && m.friendId === this.currentUserId );
        friendRating = friendRating ? friendRating.rating : null;
        //console.log(yourRating, friendRating);
        if(u.id !== this.currentUserId && (yourRating || friendRating)) { 
          return `
          <li class="match--responded match" data-friendId="${u.id}">
          <span class="match__name">${u.firstName}${u.lastName}</span>
          <span class="match__ageGender">
            33
              ${u.gender === 'male' ? 
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M372 64h-79c-10.7 0-16 12.9-8.5 20.5l16.9 16.9-80.7 80.7c-22.2-14-48.5-22.1-76.7-22.1C64.5 160 0 224.5 0 304s64.5 144 144 144 144-64.5 144-144c0-28.2-8.1-54.5-22.1-76.7l80.7-80.7 16.9 16.9c7.6 7.6 20.5 2.2 20.5-8.5V76c0-6.6-5.4-12-12-12zM144 384c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>` : 
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512"><path d="M288 176c0-79.5-64.5-144-144-144S0 96.5 0 176c0 68.5 47.9 125.9 112 140.4V368H76c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v36c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-36h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-51.6c64.1-14.5 112-71.9 112-140.4zm-224 0c0-44.1 35.9-80 80-80s80 35.9 80 80-35.9 80-80 80-80-35.9-80-80z"/></svg>` }
          </span>
          <div class="match__clickArea">
              <figure class="match__image">
                  <img src="${u.picture.large}" loading="lazy" alt="">
                  <div class="match__image__friendRating">
                  ${friendRating !== null && friendRating === 'dislike' ?
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"/></svg>` : ''}  
                  ${friendRating !== null && friendRating === 'superlike' ?
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"/></svg>` : ''}
                  ${friendRating !== null && friendRating === 'like' ? 
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"/></svg>` : ''}
                  </div>
              </figure>
              <ul class="match__rating">
                  <li class="match__item__rating ${yourRating === 'dislike' && yourRating !== null ? 'selected' : ''}" data-rating="dislike">
                      <button>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"/></svg>      
                      </button>
                  </li>
                  <li class="match__item__rating ${yourRating === 'superlike' && yourRating !== null ? 'selected' : ''}" data-rating="superlike">
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"/></svg>
                      </button>
                  </li>
                  <li class="match__item__rating ${yourRating === 'like' && yourRating !== null ? 'selected' : ''}" data-rating="like">
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"/></svg>
                      </button>
                  </li>
              </ul>
          </div>
          <div class="match__locationInfo">
              <span>${u.location.city}</span>
              <span>${u.location.country}</span>
          </div>
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
        //TODO AGE BEREKENNE !
        if(u.id !== this.currentUserId ) { 
          return `
          <li class="match--new match" data-friendid="${u.id}">
          <span class="match__name">${u.firstName}${u.lastName}</span>
          <span class="match__ageGender">
            33
              ${u.gender === 'male' ? 
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M372 64h-79c-10.7 0-16 12.9-8.5 20.5l16.9 16.9-80.7 80.7c-22.2-14-48.5-22.1-76.7-22.1C64.5 160 0 224.5 0 304s64.5 144 144 144 144-64.5 144-144c0-28.2-8.1-54.5-22.1-76.7l80.7-80.7 16.9 16.9c7.6 7.6 20.5 2.2 20.5-8.5V76c0-6.6-5.4-12-12-12zM144 384c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>` : 
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512"><path d="M288 176c0-79.5-64.5-144-144-144S0 96.5 0 176c0 68.5 47.9 125.9 112 140.4V368H76c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v36c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-36h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-51.6c64.1-14.5 112-71.9 112-140.4zm-224 0c0-44.1 35.9-80 80-80s80 35.9 80 80-35.9 80-80 80-80-35.9-80-80z"/></svg>` }
          </span>
          <div class="match__clickArea">
              <figure class="match__image">
                  <img src="${u.picture.large}" loading="lazy" alt="">
              </figure>
              <ul class="match__rating">
                  <li class="match__item__rating" data-rating="dislike">
                      <button>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"/></svg>      
                      </button>
                  </li>
                  <li class="match__item__rating" data-rating="superlike">
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"/></svg>
                      </button>
                  </li>
                  <li class="match__item__rating" data-rating="like">
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"/></svg>
                      </button>
                  </li>
              </ul>
          </div>
          <div class="match__locationInfo">
              <span>${u.location.city}</span>
              <span>${u.location.country}</span>
          </div>
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