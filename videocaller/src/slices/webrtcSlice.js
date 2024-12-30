import { createSlice } from '@reduxjs/toolkit';

const webrtcSlice = createSlice({
  name: 'webrtc',
  initialState: {
    peers: [],
    offers: [],
    candidates: [],
  },
  reducers: {
    addPeer(state, action) {
      state.peers.push(action.payload);
    },
    addOffer(state, action) {
      state.offers.push(action.payload);
    },
    addCandidate(state, action) {
      state.candidates.push(action.payload);
    },
  },
});

export const { addPeer, addOffer, addCandidate } = webrtcSlice.actions;
export default webrtcSlice.reducer;
