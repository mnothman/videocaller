import { configureStore } from '@reduxjs/toolkit';
import chatReducer from "../slices/chatSlice";
import webrtcReducer from "../slices/webrtcSlice";


const store = configureStore({
  reducer: {
    webrtc: webrtcReducer,
    chat: chatReducer,
  },
});

export default store;
