import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isAskQuestionModalOpen: boolean;
  openAskQuestionModal: () => void;
  closeAskQuestionModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isAskQuestionModalOpen: false,
  openAskQuestionModal: () => {},
  closeAskQuestionModal: () => {},
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);

  const openAskQuestionModal = () => setIsAskQuestionModalOpen(true);
  const closeAskQuestionModal = () => setIsAskQuestionModalOpen(false);

  return (
    <ModalContext.Provider value={{ isAskQuestionModalOpen, openAskQuestionModal, closeAskQuestionModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);