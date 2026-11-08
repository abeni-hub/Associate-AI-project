import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  step: 1,
  type: '',
  city: '',
  bureau: '',
  service: '',
  message: '',
  satisfaction: 0,
  fullName: '',
  phoneNumber: '',
  submitting: false,
  submitted: false,
  trackingNumber: null,
};

export const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setFeedbackStep: (state, action) => {
      state.step = action.payload;
    },
    setFeedbackType: (state, action) => {
      state.type = action.payload;
    },
    setFeedbackCity: (state, action) => {
      state.city = action.payload;
    },
    setFeedbackBureau: (state, action) => {
      state.bureau = action.payload;
    },
    setFeedbackService: (state, action) => {
      state.service = action.payload;
    },
    setFeedbackMessage: (state, action) => {
      state.message = action.payload;
    },
    setFeedbackSatisfaction: (state, action) => {
      state.satisfaction = action.payload;
    },
    setFeedbackFullName: (state, action) => {
      state.fullName = action.payload;
    },
    setFeedbackPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    setSubmittedFeedback: (state, action) => {
      state.submitted = true;
      state.trackingNumber = action.payload?.trackingNumber || null;
    },
    resetFeedback: (state) => {
      state.step = 1;
      state.type = '';
      state.city = 'Bole';
      state.bureau = '';
      state.service = '';
      state.message = '';
      state.satisfaction = 0;
      state.fullName = '';
      state.phoneNumber = '';
      state.submitting = false;
      state.submitted = false;
      state.trackingNumber = null;
    },
  },
});

export const {
  setFeedbackStep,
  setFeedbackType,
  setFeedbackCity,
  setFeedbackBureau,
  setFeedbackService,
  setFeedbackMessage,
  setFeedbackSatisfaction,
  setFeedbackFullName,
  setFeedbackPhoneNumber,
  setSubmittedFeedback,
  resetFeedback,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;
