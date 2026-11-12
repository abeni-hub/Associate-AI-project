import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FeedbackState {
  step: number;
  type: string;
  city: string;
  bureau: string;
  service: string;
  message: string;
  satisfaction: number;
  fullName: string;
  phoneNumber: string;
  submitting: boolean;
  submitted: boolean;
  trackingNumber: string | null;
}

const initialState: FeedbackState = {
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
    setFeedbackStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setFeedbackType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setFeedbackCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setFeedbackBureau: (state, action: PayloadAction<string>) => {
      state.bureau = action.payload;
    },
    setFeedbackService: (state, action: PayloadAction<string>) => {
      state.service = action.payload;
    },
    setFeedbackMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setFeedbackSatisfaction: (state, action: PayloadAction<number>) => {
      state.satisfaction = action.payload;
    },
    setFeedbackFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
    setFeedbackPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    setSubmittedFeedback: (state, action: PayloadAction<{ trackingNumber?: string } | undefined>) => {
      state.submitted = true;
      state.trackingNumber = action.payload?.trackingNumber || null;
    },
    resetFeedback: (state) => {
      state.step = 1;
      state.type = '';
      state.city = '';
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

