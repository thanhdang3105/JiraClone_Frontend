import { configureStore } from '@reduxjs/toolkit';

import issuesSlice from './issuesSlice';
import filterSlice from './filterSlice';
import userSlice from './userSlice';
import projectSlice from './projectSlice';

const store = configureStore({
    reducer: {
        user: userSlice,
        project: projectSlice,
        issues: issuesSlice,
        filter: filterSlice
    },
});

export default store;