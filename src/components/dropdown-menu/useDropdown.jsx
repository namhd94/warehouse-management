import React from "react";

export const DropdownContext = React.createContext(null);

export const useDropdown = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
};