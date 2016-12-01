'use babel';
import firebase from 'firebase';
import { firebaseConfig } from '../../secret.js'
// Initialize Firebase
const config = {
   apiKey: firebaseConfig['apiKey'],
   authDomain: firebaseConfig['authDomain'],
   databaseURL: firebaseConfig['databaseURL'],
   storageBucket: firebaseConfig['storageBucket'],
// /   messagingSenderId: "297971708009"
};

const initFirebase = () => firebase.initializeApp(config);

export { initFirebase };
