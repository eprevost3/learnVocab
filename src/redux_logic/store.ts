import { configureStore, createSlice } from '@reduxjs/toolkit'

const scoreReducer = createSlice({
    name: 'score',
    initialState: {value: 0},
    reducers: {
        incrementScore: state => {state.value += 1}
    }
})

export const { incrementScore } = scoreReducer.actions

const randomReducer = createSlice({
    name: 'random',
    initialState: {value: true},
    reducers: {
        toggleRandom: state => {state.value = !state.value}
    }
})

export const { toggleRandom } = randomReducer.actions

const datasetReducer = createSlice({
    name: 'dataset',
    initialState: {value: 'ang-fra'},
    reducers: {
        changeDataset: (state, action) => {state.value = action.payload}
    }
})

export const { changeDataset } = datasetReducer.actions

const userReducer = createSlice({
    name: 'user', 
    initialState: {value: 'Pupuce'},
    reducers: {
        changeUser: (state, action) => {state.value = action.payload}
    }
})

export const { changeUser } = userReducer.actions


const store = configureStore({
  reducer: {
    score: scoreReducer.reducer,
    random: randomReducer.reducer, 
    dataset: datasetReducer.reducer,
    user: userReducer.reducer,
  },
})

export default store
