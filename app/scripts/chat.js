'use babel';

import firebase from 'firebase';

class Chat {

  constructor(name) {
    this.name = name
  }

  meow() {
    alert( this.name + 'はミャオと鳴きました' )
  }
}
