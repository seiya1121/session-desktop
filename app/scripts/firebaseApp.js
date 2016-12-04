'use babel';

import firebase from 'firebase';
import { FIREBASE_CONFIG } from '../../secret.js';
// Initialize Firebase
const config = {
   apiKey: FIREBASE_CONFIG['apiKey'],
   authDomain: FIREBASE_CONFIG['authDomain'],
   databaseURL: FIREBASE_CONFIG['databaseURL'],
   storageBucket: FIREBASE_CONFIG['storageBucket'],
// /   messagingSenderId: "297971708009"
};

firebase.initializeApp(config);

export default class Firebase extends firebase {
  constructor{
    super(props);
  };

  database() {
    initFirebase();
    firebase.database();
  };
};
