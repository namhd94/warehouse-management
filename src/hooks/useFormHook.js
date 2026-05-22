import {createContext, useContext} from 'react';

export const FormHookContext = createContext();

const useFormHook = function() {
    return useContext(FormHookContext);
};

export default useFormHook;
