'use babel';

import firebase from 'firebase';
import { FIREBASE_CONFIG } from '../../secret.js';

export const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
export const firebaseDb = firebaseApp.database();
